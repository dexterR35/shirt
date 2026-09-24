import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
import {tracePatch,placeTrace} from './tier1-42/trace.mjs';
import {saveProfiles} from './fka-save-profiles.mjs';
import {path} from './png-paint-helpers.mjs';
export {base,neck,cuffs,rect,path,poly,sidePiping} from './png-paint-helpers.mjs';
export {panels,stripes,tapes,gradient} from './tier2-helpers.mjs';
export const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
/** Filled narrow ribbon through measured points; no unvalidated SVG stroke. */
export function line(points,color,width=.4,clip='body',opacity=1){
 const a=[],b=[];
 for(let i=0;i<points.length;i++){
  const prev=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)],dx=next[0]-prev[0],dy=next[1]-prev[1],len=Math.hypot(dx,dy)||1;
  a.push([+(points[i][0]-dy/len*width/2).toFixed(3),+(points[i][1]+dx/len*width/2).toFixed(3)]);
  b.unshift([+(points[i][0]+dy/len*width/2).toFixed(3),+(points[i][1]-dx/len*width/2).toFixed(3)]);
 }
 return path(`M${[...a,...b].map(p=>p.join(' ')).join('L')}Z`,color,clip,opacity);
}
/** Load only rejected predecessors; ready revisions cannot enter this correction batch. */
export async function refinementBatch(batch,countries,additionalScope=[]){
 const scope=structuredClone(additionalScope);
 for(const country of countries){const decisions=await read(`data/research/tier2-${country}-2026-09-24-review.json`);
  for(const d of decisions.filter(d=>d.status==='draft')){const k=await read(d.kit_revision_path);if(k.status!=='draft')throw Error('Not a draft');scope.push({...d,country:k.country_name,previous_kit:d.kit_revision_path,config:k.config,observations:k.observations,name:k.team_name});}
 }
 const profiles=[],traces=[];
 async function ink(c,row,spec,placement){
  // Repairs copy explicitly chosen unbranded print into logo-obscured regions
  // solely for ink segmentation. Original evidence remains byte-identical.
  const {repairs=[],smooth=.5,channelMask,...traceSpec}=spec;
  let input=row.reference_path;
  if(repairs.length){
   const {data,info}=await sharp(input).removeAlpha().toColourspace('srgb').raw().toBuffer({resolveWithObject:true});
   const original=Buffer.from(data);
   for(const {target:[tx,ty,tw,th],source:[sx,sy,sw,sh]}of repairs){
    if([tx,ty,tw,th,sx,sy,sw,sh].some(v=>!Number.isInteger(v)||v<0)||tx+tw>info.width||ty+th>info.height||sx+sw>info.width||sy+sh>info.height)throw Error('Invalid measured print repair');
    for(let y=0;y<th;y++)for(let x=0;x<tw;x++){const a=((ty+y)*info.width+tx+x)*3,b=((sy+Math.floor(y/th*sh))*info.width+sx+Math.floor(x/tw*sw))*3;for(let k=0;k<3;k++)data[a+k]=original[b+k];}
   }
   input=await sharp(data,{raw:info}).png().toBuffer();
  }
  if(channelMask){
   const {data,info}=await sharp(input).removeAlpha().toColourspace('srgb').raw().toBuffer({resolveWithObject:true});
   for(let i=0;i<data.length;i+=3){const [r,g,b]=data.subarray(i,i+3),values={red:r-g,yellow:(r+g)/2-b,lum:(r+g+b)/3};const on=Object.entries(channelMask).every(([key,[min,max]])=>values[key]>=min&&values[key]<=max);data[i]=data[i+1]=data[i+2]=on?255:0;}
   input=await sharp(data,{raw:info}).png().toBuffer();Object.assign(traceSpec,{mode:'value',threshold:128,min:0,max:255});
  }
  if(smooth>.5)input=await sharp(input).blur(smooth).png().toBuffer();
  const trace=await tracePatch({reference:input,...traceSpec});
  c.layers.push(...placeTrace(trace,placement));
  traces.push({key:row.key,reference:row.reference_path,source_sha256:row.reference_sha256,spec,placement,ink_pixels:trace.ink_pixels,method:'Discrete source-ink contours only. Measured placement and explicit branding exclusions; source pixels and continuous fabric shading are not embedded.'});
 }
 function add(row,c,observations){profiles.push({name:row.name,country:row.country,variant:row.variant,make:()=>structuredClone(c),observations});}
 async function save(){
  const reviews=process.argv.includes('--reviewed')?await read(`data/research/${batch}-review.json`):[];
  if(process.argv.includes('--reviewed')&&(reviews.length!==profiles.length||new Set(reviews.map(r=>r.key)).size!==profiles.length))throw Error('Missing individual review decisions');
  for(const d of reviews){const p=profiles.find(p=>`${p.name}:${p.variant}`===d.key);if(!p||d.config_sha256!==crypto.createHash('sha256').update(JSON.stringify(p.make())).digest('hex')||!d.notes||!['draft','ready'].includes(d.status))throw Error('Stale review '+d.key);await fs.access(d.comparison_path);p.remaining=d.remaining;}
  await fs.writeFile(`data/research/${batch}-scope.json`,JSON.stringify(scope.map(({config,...r})=>r),null,2)+'\n');
  await fs.writeFile(`data/research/${batch}-traces.json`,JSON.stringify({batch,traces},null,2)+'\n');
  await saveProfiles(profiles,batch,{date:'2026-09-24',reviewed:reviews.filter(r=>r.status==='ready').map(r=>r.key)});
 }
 return {scope,add,ink,save};
}
