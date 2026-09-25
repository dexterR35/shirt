import fs from 'node:fs/promises';
import sharp from 'sharp';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const details=await read('data/research/footballkitarchive/observations/rest-details.json');
const groups={west:['Belgium','Netherlands','Portugal','Scotland','Andorra','Gibraltar'],north:['Norway','Denmark','Sweden','Latvia','Lithuania'],central:['Austria','Czechia','Slovakia','Hungary','Poland','Switzerland']};
const escape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
for(const group of ['west','north','central','east']){
 const batch=`rest-${group}-2026-09-25`,out=`artifacts/footballkitarchive/${batch}`;await fs.mkdir(out,{recursive:true});
 const rows=[];
 for(const d of details.filter(d=>group==='east'?!Object.values(groups).flat().includes(d.country):groups[group].includes(d.country))){
  const r=await read(`data/research/footballkitarchive/records/${d.task_id}.json`);
  if(!r.local_reference_path)throw Error('Missing image '+d.name);
  rows.push({name:d.name,country:d.country,variant:d.variant,task_id:d.task_id,reference:r.local_reference_path});
 }
 rows.sort((a,b)=>a.name.localeCompare(b.name)||b.variant.localeCompare(a.variant));
 for(let start=0;start<rows.length;start+=8){
  const tiles=[];
  for(let i=start;i<Math.min(start+8,rows.length);i++){
   const r=rows[i],left=(i-start)%4*350,top=Math.floor((i-start)/4)*400;
   tiles.push({input:Buffer.from(`<svg width="350" height="40"><text x="8" y="26" fill="white" font-family="Arial" font-size="16">${i+1}. ${escape(r.name)} ${r.variant}</text></svg>`),left,top});
   tiles.push({input:await sharp(r.reference).resize(350,360,{fit:'contain',background:'#fff'}).png().toBuffer(),left,top:top+40});
  }
  await sharp({create:{width:1400,height:800,channels:4,background:'#152033'}}).composite(tiles).png().toFile(`${out}/sources-${start/8+1}.png`);
 }
 await fs.writeFile(`${out}/source-order.json`,JSON.stringify(rows,null,2)+'\n');console.log(group,rows.length);
}
