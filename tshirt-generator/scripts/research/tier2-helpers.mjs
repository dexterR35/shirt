import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
import {tracePatch,placeTrace} from './tier1-42/trace.mjs';
import {saveProfiles} from './fka-save-profiles.mjs';
import {poly,rect,path} from './png-paint-helpers.mjs';
export {base,neck,cuffs,rect,path,poly,sidePiping} from './png-paint-helpers.mjs';
export const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
export const mirror=p=>p.map(([x,y])=>[200-x,y]);
export function panels(c,points,color){c.layers.push(poly(points,color),poly(mirror(points),color));}
export function stripes(c,xs,width,color,clip='body'){for(const x of xs)c.layers.push(rect(x,0,width,200,color,clip));}
export function tapes(c,color,count=2,width=1.3){for(let i=0;i<count;i++)panels(c,[[35+i*3,24],[76,4+i*3],[76,4+i*3+width],[35+i*3,24+width]],color);}
export const gradient=(stops,x1=0,y1=0,x2=0,y2=200)=>({type:'linearGradient',x1,y1,x2,y2,stops:stops.map(([offset,color])=>({offset,color}))});
export async function makeBatch(batch,country){
 const profiles=[],traces=[],records=await Promise.all((await fs.readdir('data/research/footballkitarchive/records')).map(f=>read(`data/research/footballkitarchive/records/${f}`)));
 const add=(name,variant,c,observations)=>{
  if(name==='Greuther Fürth'&&variant==='away'){
   const layers=[];for(const fill of ['#093E2E','#167651']){let d='';for(const l of c.layers.filter(l=>l.fill===fill)){const part=l.type==='polygon'?`M${l.points.map(p=>p.join(' ')).join('L')}Z`:l.d;if(d.length+part.length>19000){layers.push(path(d,fill));d='';}d+=part;}if(d)layers.push(path(d,fill));}c.layers=layers;
  }
  profiles.push({name,variant,country,make:()=>structuredClone(c),observations});
 };
 async function ink(c,name,variant,box,{mode='dark',threshold=2,color,opacity=1,x=49,y=0,width=102,height,clip='body',sample=240,blur=20}={}){
  const r=records.find(r=>r.team_name===name&&r.variant===variant&&r.country_name===country);if(!r)throw Error('No source '+name+variant);
  const meta=await sharp(r.local_reference_path).metadata(),b=[Math.round(box[0]*meta.width),Math.round(box[1]*meta.height),Math.round(box[2]*meta.width),Math.round(box[3]*meta.height)];
  const trace=await tracePatch({reference:r.local_reference_path,box:b,width:sample,mode,threshold,blur});
  const h=height??width*trace.height/trace.width;
  for(let yy=y,row=0;yy<(height?y+1:200);yy+=h,row++){const tile=row%2?{...trace,groups:trace.groups.map(g=>g.map(p=>p.map(([xx,yy])=>[xx,trace.height-yy])))}:trace;c.layers.push(...placeTrace(tile,{x,y:yy,width,height:h,color,opacity,clip}));}
  traces.push({name,variant,reference:r.local_reference_path,source_sha256:r.image_sha256,box:b,mode,threshold,sample,blur,ink_pixels:trace.ink_pixels,placement:{x,y,width,height:h,repeat:!height,reflect_alternate_rows:true,color,opacity,clip},method:'Branding-free source print crop converted to constant-color vector contours; proportions retained with reflected repeats. Pattern placement adapted to common silhouette.'});
 }
 async function save(){
  const reviews=process.argv.includes('--reviewed')?await read(`data/research/${batch}-review.json`):[];
  if(process.argv.includes('--reviewed')&&(reviews.length!==profiles.length||new Set(reviews.map(r=>r.key)).size!==profiles.length))throw Error('Individual reviews required');
  for(const r of reviews){const p=profiles.find(p=>`${p.name}:${p.variant}`===r.key);if(!p||r.config_sha256!==crypto.createHash('sha256').update(JSON.stringify(p.make())).digest('hex')||!r.notes||!['ready','draft'].includes(r.status))throw Error('Stale review '+r.key);await fs.access(r.comparison_path);p.remaining=r.remaining;}
  await fs.writeFile(`data/research/${batch}-traces.json`,JSON.stringify({date:'2026-09-24',batch,traces},null,2)+'\n');
  await saveProfiles(profiles,batch,{date:'2026-09-24',reviewed:reviews.filter(r=>r.status==='ready').map(r=>r.key)});
 }
 return {profiles,add,ink,save};
}
