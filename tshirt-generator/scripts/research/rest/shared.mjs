import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
import {refinementBatch} from '../tier2-refinement-helpers.mjs';
import {path} from '../png-paint-helpers.mjs';
export {base,neck,cuffs,poly,rect,path,sidePiping,panels,stripes,tapes,line,W,K,sleeves,raglan,shoulder,side,diagonals,zigzags,chevronField} from '../latest-available/shared.mjs';
export {gradient} from '../tier2-helpers.mjs';
export {shoulderBands} from '../png-paint-helpers.mjs';

export async function restBatch(group){
 const batch=`rest-${group}-2026-09-25`;
 const rows=JSON.parse(await fs.readFile(`artifacts/footballkitarchive/${batch}/source-order.json`,'utf8'));
 const scope=await Promise.all(rows.map(async r=>({...r,key:`${r.name}:${r.variant}`,reference_path:r.reference,reference_sha256:crypto.createHash('sha256').update(await fs.readFile(r.reference)).digest('hex')})));
 const b=await refinementBatch(batch,[],scope);
 const tileInk=async(c,r,box,color,{mode='dark',threshold=4,blur=12,x=49,y=0,width=102,height=100,clip='body',end=200,sample=300,smooth=.5}={})=>{
  const m=await sharp(r.reference_path).metadata(),pixels=box.map((v,i)=>Math.round(v*(i%2?m.height:m.width)));
  for(let yy=y;yy<end;yy+=height)await b.ink(c,r,{box:pixels,width:sample,mode,threshold,blur,smooth},{x,y:yy,width,height,color,clip});
 };
 function addKit(r,c,n){
  // Dense linework stays within validated per-path and layer limits.
  if(c.layers.length>400){const out=[];for(const l of c.layers){const d=l.type==='path'?l.d:l.type==='polygon'?`M${l.points.map(p=>p.join(' ')).join('L')}Z`:l.type==='rect'?`M${l.x} ${l.y}h${l.width}v${l.height}h${-l.width}Z`:null;const prev=out.at(-1);if(!d||typeof l.fill!=='string'){out.push(l);continue;}if(prev?.type==='path'&&prev.fill===l.fill&&prev.clip===l.clip&&(prev.opacity??1)===(l.opacity??1)&&prev.d.length+d.length<18000)prev.d+=d;else out.push(path(d,l.fill,l.clip,l.opacity??1));}c.layers=out;}
  b.add(r,c,n+' Independently evidenced '+r.variant+' reference selected from the full club history. Actual source season and event/version labels retained. Colors estimated from the source, with fine print and obscured regions adapted to the common silhouette. Original PNG alpha, fabric and physical round collar preserved; emblems, sponsors, manufacturer symbols and lettering excluded.');
 }
 return {...b,batch,tileInk,addKit};
}
