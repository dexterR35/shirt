import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {tracePatch,placeTrace} from '../tier1-42/trace.mjs';
export {base,path,rect,poly,neck,cuffs,shoulderBands,sidePiping} from '../png-paint-helpers.mjs';
export const batch='tier1-completion-2026-09-24',date='2026-09-24',out=`artifacts/footballkitarchive/${batch}`;
export const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
export const scope=await read(`data/research/${batch}-scope.json`),profiles=[],traces=[];
export async function previous(name,variant){const r=scope.find(r=>r.name===name&&r.variant===variant);return structuredClone((await read(r.kit)).config);}
export function add(name,country,variant,config,observations){profiles.push({name,country,variant,make:()=>structuredClone(config),observations,remaining:'Source comparison pending.'});}
export const grad=(a,b,x1,y1,x2,y2)=>({type:'linearGradient',x1,y1,x2,y2,stops:[{offset:0,color:a},{offset:1,color:b}]});
export async function ink(name,variant,spec,placement){
  const r=scope.find(r=>r.name===name&&r.variant===variant),reference=r.ref;
  const t=await tracePatch({reference,...spec});
  traces.push({team:name,variant,reference,source_sha256:crypto.createHash('sha256').update(await fs.readFile(reference)).digest('hex'),...spec,ink_pixels:t.ink_pixels,placement,method:'Inspected printed region converted to vector contours; explicit exclusions remove branding where present. Fine detail simplified, source photograph not embedded.'});
  return placeTrace(t,placement);
}
export function mapped(d,map){return d.replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g,(_,x,y)=>map(+x,+y).map(v=>+v.toFixed(3)).join(' '));}
export function line(points,fill,width=.3,clip='body',opacity=1){
  let d='';const n=x=>+x.toFixed(3);
  for(let i=1;i<points.length;i++){const[x,y]=points[i-1],[xx,yy]=points[i],len=Math.hypot(xx-x,yy-y);if(!len)continue;const dx=(yy-y)/len*width/2,dy=(x-xx)/len*width/2;d+=`M${n(x+dx)} ${n(y+dy)}L${n(xx+dx)} ${n(yy+dy)}L${n(xx-dx)} ${n(yy-dy)}L${n(x-dx)} ${n(y-dy)}Z`;}
  return {type:'path',d,fill,clip,opacity};
}
