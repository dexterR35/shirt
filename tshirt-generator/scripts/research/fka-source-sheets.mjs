import fs from 'node:fs/promises';
import sharp from 'sharp';
const country=process.argv[2]||'Spain',capture=process.argv[3];
if(capture&&!/^[a-z0-9-]+$/.test(capture))throw Error('Invalid capture name');
const out=`artifacts/footballkitarchive/${capture||country.toLowerCase()}`;
await fs.mkdir(out,{recursive:true});
const records=[];
for(const file of await fs.readdir('data/research/footballkitarchive/records')){
  const r=JSON.parse(await fs.readFile(`data/research/footballkitarchive/records/${file}`,'utf8'));
  if(r.country_name===country&&r.local_reference_path&&(!capture||r.capture_path.endsWith(`/${capture}.tsv`)))records.push(r);
}
records.sort((a,b)=>a.team_name.localeCompare(b.team_name)||b.variant.localeCompare(a.variant));
for(let start=0;start<records.length;start+=8){
  const tiles=[];
  for(let i=start;i<Math.min(start+8,records.length);i++){
    const r=records[i],left=(i-start)%4*350,top=Math.floor((i-start)/4)*400;
    tiles.push({input:Buffer.from(`<svg width="350" height="40"><text x="8" y="26" fill="white" font-family="Arial" font-size="17">${i+1}. ${r.team_name} ${r.variant}</text></svg>`),left,top});
    tiles.push({input:await sharp(r.local_reference_path).resize(350,360,{fit:'contain',background:'#FFFFFF'}).png().toBuffer(),left,top:top+40});
  }
  await sharp({create:{width:1400,height:800,channels:4,background:'#152033'}}).composite(tiles).png().toFile(`${out}/sources-${start/8+1}.png`);
}
await fs.writeFile(`${out}/source-order.json`,JSON.stringify(records.map(r=>({name:r.team_name,variant:r.variant,task_id:r.task_id,reference:r.local_reference_path})),null,2)+'\n');
console.log(records.length,'source images arranged for review');
