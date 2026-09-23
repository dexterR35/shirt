import fs from 'node:fs/promises';
import sharp from 'sharp';
import {PNG_BASE,renderColorArtwork,compositePixels} from '../src/lib/png-shirt.js';
import {neutralConfig} from '../src/lib/shirt-renderer.js';

// Native source crop: no resizing, tracing, quantization, blur or texture removal.
const crop={left:2072,top:572,width:3856,height:3856};
const source=await sharp('base.png').extract(crop).ensureAlpha().raw().toBuffer();
await fs.mkdir('artifacts/png-base',{recursive:true});
const team=JSON.parse(await fs.readFile('data/kits/team_1078eddef5882c6813d4-home-r002.json','utf8'));
const samples=[['original',neutralConfig()],['blue',neutralConfig('#2452B5')],['barcelona-home-preview',team.config]];
const tiles=[];
for(const [name,config] of samples){
  const paint=renderColorArtwork(config).replace('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">',`<svg xmlns="http://www.w3.org/2000/svg" width="${crop.width}" height="${crop.height}" viewBox="${crop.left} ${crop.top} ${crop.width} ${crop.height}"><rect x="${crop.left}" y="${crop.top}" width="${crop.width}" height="${crop.height}" fill="#fff"/><g transform="translate(${PNG_BASE.x} ${PNG_BASE.y}) scale(${PNG_BASE.scale})">`).replace('</svg>','</g></svg>');
  const color=await sharp(Buffer.from(paint)).ensureAlpha().raw().toBuffer();
  const result=compositePixels(source,color);
  await sharp(result,{raw:{width:crop.width,height:crop.height,channels:4}}).png().toFile(`artifacts/png-base/${name}.png`);
  tiles.push(await sharp(result,{raw:{width:crop.width,height:crop.height,channels:4}}).resize(450,450).png().toBuffer());
}
await sharp({create:{width:1410,height:490,channels:4,background:'#152033'}}).composite(tiles.map((input,i)=>({input,left:20+i*460,top:20}))).png().toFile('artifacts/png-base/preview-comparison.png');
await fs.writeFile('artifacts/png-base/review.json',JSON.stringify({base:PNG_BASE.version,source_sha256:PNG_BASE.sha256,original_dimensions:[8000,5000],review_crop:crop,source_resampled:false,samples:samples.map(([name])=>name),note:'Blue is a generic color example. Barcelona uses previously source-reviewed color artwork adapted to the physical round-collar PNG; this is a layout preview, not a newly approved team revision.'},null,2)+'\n');
console.log('Three native-resolution PNG proofs saved; source texture and alpha retained.');
