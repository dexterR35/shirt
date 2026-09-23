import fs from 'node:fs/promises';
import sharp from 'sharp';
import {renderColorArtwork,compositePixels} from '../src/lib/png-shirt.js';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const list=await read('artifacts/layout-correction/catalog.json');
const source=await sharp('base.png').extract({left:2072,top:572,width:3856,height:3856}).resize(600,600).ensureAlpha().raw().toBuffer();
const directory='artifacts/layout-correction';
async function render(config){
  const paint=await sharp(Buffer.from(renderColorArtwork(config))).resize(600,600).ensureAlpha().raw().toBuffer();
  return sharp(compositePixels(source,paint),{raw:{width:600,height:600,channels:4}}).png().toBuffer();
}
for(let start=0;start<list.length;start+=4){
  const tiles=[];
  for(let i=start;i<Math.min(start+4,list.length);i++){
    const r=list[i],layout=await read(`data/kits/png-layouts/${r.id}-${r.variant}-p001.json`);
    const png=await render(layout.config);
    await fs.writeFile(`${directory}/${r.id}-${r.variant}-after.png`,png);
    const actual=await sharp(png).resize(400,400).png().toBuffer();
    const reference=layout.team_name==='Leeds United'?'data/research/references/leeds-home-user-front.png':r.reference;
    const ref=await sharp(reference).resize(400,400,{fit:'contain',background:'#e5e8ec'}).png().toBuffer();
    const x=(i-start)%2*820,y=Math.floor((i-start)/2)*440;
    const label=Buffer.from(`<svg width="800" height="35"><text x="10" y="25" font-family="Arial" font-size="18" fill="white">${r.name} ${r.variant}: reference / corrected</text></svg>`);
    tiles.push({input:label,left:x,top:y},{input:ref,left:x,top:y+35},{input:actual,left:x+400,top:y+35});
  }
  await sharp({create:{width:1640,height:880,channels:4,background:'#152033'}}).composite(tiles).png().toFile(`${directory}/after-${start/4+1}.png`);
}
const leeds=list.find(r=>r.name==='Leeds United');
await sharp({create:{width:1300,height:490,channels:4,background:'#152033'}}).composite([
  {input:await sharp('data/research/references/leeds-home-user-front.png').resize(400,440,{fit:'contain',background:'#e5e8ec'}).png().toBuffer(),left:10,top:40},
  {input:await sharp('artifacts/layout-correction/leeds-before-user.png').resize(425,440,{fit:'contain',background:'#152033'}).png().toBuffer(),left:425,top:40},
  {input:await sharp(`${directory}/${leeds.id}-home-after.png`).resize(440,440).png().toBuffer(),left:855,top:40},
  {input:Buffer.from('<svg width="1300" height="35"><g fill="white" font-family="Arial" font-size="18"><text x="20" y="25">REFERENCE</text><text x="445" y="25">BEFORE</text><text x="875" y="25">CORRECTED PNG LAYOUT</text></g></svg>'),left:0,top:0},
]).png().toFile(`${directory}/leeds-comparison.png`);
console.log('Rendered all 15 layouts and Leeds comparison for visual review.');
