import fs from 'node:fs/promises';
import sharp from 'sharp';
import {renderColorArtwork,compositePixels} from '../../src/lib/png-shirt.js';
const out=`artifacts/footballkitarchive/${process.argv[2]}`;
const entries=JSON.parse(await fs.readFile(`${out}/manifest.json`,'utf8'));
const source=await sharp('base.png').extract({left:2072,top:572,width:3856,height:3856}).resize(600,600).ensureAlpha().raw().toBuffer();
for(let start=0;start<entries.length;start+=4){
  const tiles=[];
  for(let i=start;i<Math.min(start+4,entries.length);i++){
    const e=entries[i],kit=JSON.parse(await fs.readFile(e.kit,'utf8'));
    const paint=await sharp(Buffer.from(renderColorArtwork(kit.config))).resize(600,600).ensureAlpha().raw().toBuffer();
    const png=await sharp(compositePixels(source,paint),{raw:{width:600,height:600,channels:4}}).png().toBuffer();
    await fs.writeFile(`${out}/${kit.team_id}-${kit.variant}.png`,png);
    const left=(i-start)%2*800,top=Math.floor((i-start)/2)*440;
    tiles.push({input:Buffer.from(`<svg width="800" height="36"><text x="10" y="25" fill="white" font-family="Arial" font-size="18">${e.name} ${e.variant}: archive / PNG adaptation</text></svg>`),left,top});
    tiles.push({input:await sharp(e.reference).resize(400,400,{fit:'contain',background:'#FFFFFF'}).png().toBuffer(),left,top:top+36});
    tiles.push({input:await sharp(png).resize(400,400).png().toBuffer(),left:left+400,top:top+36});
  }
  await sharp({create:{width:1600,height:880,channels:4,background:'#152033'}}).composite(tiles).png().toFile(`${out}/comparison-${start/4+1}.png`);
}
console.log(entries.length,'source/render comparisons');
