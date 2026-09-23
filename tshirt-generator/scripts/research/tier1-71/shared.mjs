import fs from 'node:fs/promises';
export {base,neck,cuffs,shoulderBands,sidePiping,path,rect,poly} from '../png-paint-helpers.mjs';
import {path,poly} from '../png-paint-helpers.mjs';
export const batch='tier1-71-2026-09-23';
export const rows=JSON.parse(await fs.readFile('artifacts/footballkitarchive/tier1-remaining-71.json','utf8'));
export const profiles=[];
const previousKits=[];
for(const f of await fs.readdir('data/kits'))if(f.endsWith('.json')){
  const k=JSON.parse(await fs.readFile(`data/kits/${f}`,'utf8'));
  if(k.research_batch!==batch)previousKits.push(k);
}
export function previous(name,variant){
  const k=previousKits.filter(k=>k.team_name===name&&k.variant===variant).sort((a,b)=>b.revision.localeCompare(a.revision))[0];
  if(!k)throw Error(`No previous drawing: ${name} ${variant}`);
  return structuredClone(k.config);
}
export function add(name,variant,make,observations,remaining){
  const r=rows.find(r=>r.team===name&&r.variant===variant);
  if(!r||profiles.some(p=>p.name===name&&p.variant===variant))throw Error(`Invalid/duplicate scope: ${name} ${variant}`);
  profiles.push({country:r.country,name,variant,make,observations,remaining});
}
export const n=x=>+x.toFixed(3);
export const mirror=p=>p.map(([x,y])=>[200-x,y]);
export const gradient=(a,b,x1=0,y1=0,x2=0,y2=200)=>({type:'linearGradient',x1,y1,x2,y2,stops:[{offset:0,color:a},{offset:1,color:b}]});
/** Filled line geometry, avoiding raw SVG stroke/markup or unsupported attributes. */
export function line(points,color,width=.3,clip='body',opacity=1){
  let d='';
  for(let i=1;i<points.length;i++){
    const [x,y]=points[i-1],[xx,yy]=points[i],len=Math.hypot(xx-x,yy-y);if(!len)continue;
    const dx=(yy-y)/len*width/2,dy=(x-xx)/len*width/2;
    d+=`M${n(x+dx)} ${n(y+dy)}L${n(xx+dx)} ${n(yy+dy)}L${n(xx-dx)} ${n(yy-dy)}L${n(x-dx)} ${n(y-dy)}Z`;
  }
  return path(d,color,clip,opacity);
}
export const circle=(x,y,r)=>`M${n(x-r)} ${n(y)}a${n(r)} ${n(r)} 0 1 0 ${n(2*r)} 0a${n(r)} ${n(r)} 0 1 0 -${n(2*r)} 0Z`;
export function sleeves(c,color){c.colors.leftSleeve=c.colors.rightSleeve=color;}
export function trimPattern(c,color,kind='chevrons'){
  let d='';
  for(let i=0;i<29;i++){
    const a=Math.PI*(i+.15)/29,xx=100-28*Math.cos(a),yy=5+19*Math.sin(a);
    d+=kind==='chevrons'?`M${n(xx)} ${n(yy-1.1)}l1.1 .7-1.1 1.1-.4-.4.6-.7-.6-.4Z`:`M${n(xx)} ${n(yy-.9)}l.9-.3.7 1.6-.9 .3Z`;
  }
  c.collar.layers.splice(-1,0,path(d,color));
}
/** Explicit vertex network; useful for observed shard/architectural/vein boundaries. */
export function network(c,edges,color,width=.3,clip='body',opacity=1){for(const points of edges)c.layers.push(line(points,color,width,clip,opacity));}
export function hatch(points,color,spacing=1,width=.3,angle=0,clip='all',opacity=1){
  const co=Math.cos(angle),si=Math.sin(angle),p=points.map(([x,y])=>[x*co+y*si,-x*si+y*co]);let d='';
  const low=Math.min(...p.map(v=>v[1])),high=Math.max(...p.map(v=>v[1]));
  for(let yy=low+.2;yy<high;yy+=spacing){
    const xs=[];for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];if((a[1]<=yy&&b[1]>yy)||(b[1]<=yy&&a[1]>yy))xs.push(a[0]+(yy-a[1])*(b[0]-a[0])/(b[1]-a[1]));}
    xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2)d+=line([[xs[i]*co-yy*si,xs[i]*si+yy*co],[xs[i+1]*co-yy*si,xs[i+1]*si+yy*co]],color,width,clip).d;
  }
  return path(d,color,clip,opacity);
}
