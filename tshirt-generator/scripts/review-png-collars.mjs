import fs from 'node:fs/promises';
import sharp from 'sharp';
import {renderColorArtwork,compositePixels} from '../src/lib/png-shirt.js';
const out='artifacts/collar-correction';
await fs.mkdir(out,{recursive:true});
const source=await sharp('base.png').extract({left:2072,top:572,width:3856,height:3856}).resize(600,600).ensureAlpha().raw().toBuffer();
const files=(await fs.readdir('data/kits/png-layouts')).filter(f=>f.endsWith('-p002.json'));
const tiles=[];
for(const [i,file] of files.entries()){
  const layout=JSON.parse(await fs.readFile(`data/kits/png-layouts/${file}`,'utf8'));
  const paint=await sharp(Buffer.from(renderColorArtwork(layout.config))).resize(600,600).ensureAlpha().raw().toBuffer();
  const png=await sharp(compositePixels(source,paint),{raw:{width:600,height:600,channels:4}}).png().toBuffer();
  await fs.writeFile(`${out}/${layout.team_id}-${layout.variant}.png`,png);
  const crop=await sharp(png).extract({left:165,top:0,width:270,height:135}).resize(540,270).png().toBuffer();
  const label=Buffer.from(`<svg width="540" height="32"><text x="12" y="24" font-family="Arial" font-size="18" fill="white">${layout.team_name} ${layout.variant}</text></svg>`);
  const x=(i%2)*550,y=Math.floor(i/2)*310;
  tiles.push({input:label,left:x,top:y},{input:crop,left:x,top:y+32});
}
await sharp({create:{width:1100,height:1240,channels:4,background:'#152033'}}).composite(tiles).png().toFile(`${out}/collars.png`);
const id='team_e5d01d1e2dafaef8522d-away';
await sharp({create:{width:1200,height:640,channels:4,background:'#152033'}}).composite([
  {input:await sharp(`artifacts/layout-correction/${id}-after.png`).resize(600,600).png().toBuffer(),left:0,top:40},
  {input:await fs.readFile(`${out}/${id}.png`),left:600,top:40},
  {input:Buffer.from('<svg width="1200" height="40"><g font-family="Arial" font-size="22" fill="white"><text x="20" y="29">BEFORE</text><text x="620" y="29">ORIGINAL PNG COLLAR + TEAM COLORS</text></g></svg>'),left:0,top:0},
]).png().toFile(`${out}/ipswich-comparison.png`);
