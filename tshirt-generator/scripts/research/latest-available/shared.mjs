import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
import {refinementBatch,line} from '../tier2-refinement-helpers.mjs';
import {base,neck,cuffs,poly,rect,path,sidePiping,shoulderBands} from '../png-paint-helpers.mjs';
import {panels,stripes} from '../tier2-helpers.mjs';
export {base,neck,cuffs,poly,rect,path,sidePiping,panels,stripes,line};
// Follow the PNG shoulder curve; callers set observed band count and width.
export function tapes(c,color,count=3,width=1,end=40){shoulderBands(c,color,{count,width,gap:1,end});}
export const W='#F1F2EE',K='#1C1E20';
export function sleeves(c,color){c.colors.leftSleeve=c.colors.rightSleeve=c.colors.leftCuff=c.colors.rightCuff=color;}
export function raglan(c,color){sleeves(c,color);panels(c,[[0,0],[77,3],[73,12],[61,19],[52,34],[49,78],[0,95]],color);}
export function shoulder(c,color){panels(c,[[77,4],[45,16],[25,30],[31,35],[49,23],[77,9]],color);}
export function side(c,color){panels(c,[[49,77],[57,114],[54,197],[49,199]],color);}
export function diagonals(c,color,width=10,gap=23,clip='body'){for(let y=-120;y<300;y+=gap)c.layers.push(poly([[0,y+90],[200,y-30],[200,y-30+width],[0,y+90+width]],color,clip));}
export function zigzags(c,color,spacing=8,width=.6,clip='body',start=0){for(let y=start;y<205;y+=spacing){const points=[];for(let x=0;x<=200;x+=20)points.push([x,y+(x/20%2?7:0)]);c.layers.push(line(points,color,width,clip));}}
export function chevronField(c,color,clip='body'){let d='';for(let y=0;y<200;y+=24)for(let x=0;x<200;x+=40)for(let i=0;i<5;i++){const part=line([[x,y+i*2],[x+20,y+12+i*2],[x+40,y+i*2]],color,.4,clip).d;if(d.length+part.length>18000){c.layers.push(path(d,color,clip));d='';}d+=part;}if(d)c.layers.push(path(d,color,clip));}
function compact(c){
 if(c.layers.length<400)return;
 const out=[];
 for(const l of c.layers){
  if(typeof l.fill!=='string'){out.push(l);continue;}
  const d=l.type==='path'?l.d:l.type==='polygon'?`M${l.points.map(p=>p.join(' ')).join('L')}Z`:l.type==='rect'?`M${l.x} ${l.y}h${l.width}v${l.height}h${-l.width}Z`:null;
  if(!d){out.push(l);continue;}
  const prev=out.at(-1);
  if(prev?.type==='path'&&prev.fill===l.fill&&prev.clip===l.clip&&(prev.opacity??1)===(l.opacity??1)&&prev.d.length+d.length<18000)prev.d+=d;
  else out.push(path(d,l.fill,l.clip,l.opacity??1));
 }
 c.layers=out;
}
export async function batchFor(country){
 const batch=`latest-available-${country.toLowerCase()}-2026-09-25`,rows=JSON.parse(await fs.readFile(`artifacts/footballkitarchive/${batch}/source-order.json`,'utf8'));
 const scope=await Promise.all(rows.map(async r=>({...r,country,key:`${r.name}:${r.variant}`,reference_path:r.reference,reference_sha256:crypto.createHash('sha256').update(await fs.readFile(r.reference)).digest('hex')})));
 const b=await refinementBatch(batch,[],scope);
 const tileInk=async(c,r,box,color,{mode='dark',threshold=4,blur=12,x=49,y=0,width=102,height=100,clip='body',end=200}={})=>{
  const m=await sharp(r.reference_path).metadata(),pixels=box.map((v,i)=>Math.round(v*(i%2?m.height:m.width)));
  for(let yy=y;yy<end;yy+=height)await b.ink(c,r,{box:pixels,width:300,mode,threshold,blur},{x,y:yy,width,height,color,clip});
 };
 return {...b,batch,tileInk,addKit:(r,c,n)=>{compact(c);b.add(r,c,n+' Latest independently evidenced '+r.variant+' kit selected after checking the team history under the 25 September latest-equipment instruction. Actual source season retained. Colors estimated; fine print and obscured construction adapted to the common silhouette. Original PNG fabric, alpha and physical round collar preserved. Crests, sponsors, manufacturer symbols and lettering removed.');}};
}
