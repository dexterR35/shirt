import fs from 'node:fs/promises';
import sharp from 'sharp';
const rows=JSON.parse(await fs.readFile('artifacts/footballkitarchive/tier1-remaining-71.json','utf8'));
const out='artifacts/footballkitarchive/tier1-remaining-71';
await fs.mkdir(out,{recursive:true});
for(let start=0;start<rows.length;start+=8){
  const tiles=[];
  for(let i=start;i<Math.min(start+8,rows.length);i++){
    const r=rows[i],left=(i-start)%4*400,top=Math.floor((i-start)/4)*470;
    tiles.push({input:Buffer.from(`<svg width="400" height="38"><text x="8" y="25" fill="white" font-family="Arial" font-size="17">${i+1}. ${r.team} ${r.variant}</text></svg>`),left,top});
    tiles.push({input:await sharp(r.ref).resize(400,430,{fit:'contain',background:'#FFFFFF'}).png().toBuffer(),left,top:top+38});
  }
  await sharp({create:{width:1600,height:940,channels:4,background:'#152033'}}).composite(tiles).png().toFile(`${out}/sources-${start/8+1}.png`);
}
console.log(rows.length,'remaining source images arranged');
