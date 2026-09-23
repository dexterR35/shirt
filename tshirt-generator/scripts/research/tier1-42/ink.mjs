import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
import {source,batch} from './shared.mjs';
import {tracePatch,placeTrace,tileTrace} from './trace.mjs';
export {placeTrace,tileTrace};
export const traces=[];
/** The crop is an observed print fragment, never a sponsor or badge. */
export async function ink(name,variant,spec){
  const reference=source(name,variant),id=`${name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${variant}-${traces.length+1}`;
  const t=await tracePatch({reference,...spec});
  const preview=`artifacts/footballkitarchive/${batch}/ink/${id}.png`;
  await fs.mkdir(`artifacts/footballkitarchive/${batch}/ink`,{recursive:true});
  const layers=placeTrace(t,{x:0,y:0,width:400,height:400,color:'#222222'});
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="white"/>${layers.map(l=>`<path d="${l.d}" fill="${l.fill}"/>`).join('')}</svg>`;
  await sharp({create:{width:800,height:400,channels:4,background:'#FFFFFF'}}).composite([{input:await sharp(reference).extract({left:spec.box[0],top:spec.box[1],width:spec.box[2],height:spec.box[3]}).resize(400,400).png().toBuffer(),left:0,top:0},{input:Buffer.from(svg),left:400,top:0}]).png().toFile(preview);
  traces.push({id,team:name,variant,reference,source_sha256:crypto.createHash('sha256').update(await fs.readFile(reference)).digest('hex'),...spec,preview,ink_pixels:t.ink_pixels,method:'Single-ink contour extraction from a branding-free reference crop; constant chosen fill; no raster embedded. Repeated crops are adaptations, not exact full-shirt tracing.'});
  return t;
}
