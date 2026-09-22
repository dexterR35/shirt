// Optional PNG/preview exporter. Requires sharp; the SVG renderer has no dependencies.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {renderShirt} from './shirt-engine.mjs';
const sourceRoot=path.dirname(fileURLToPath(import.meta.url));
// Keep the user's original PNGs immutable. Legacy demo renders go to artifacts.
const root=path.resolve(sourceRoot,'../../artifacts/starter-preview');
const presets=JSON.parse(await fs.readFile(path.join(sourceRoot,'presets.json'),'utf8'));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
const inner=(p,id)=>renderShirt(p,id).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
await fs.mkdir(path.join(root,'png'),{recursive:true});
for(const p of presets){
  const svg=renderShirt(p);
  await sharp(Buffer.from(svg)).resize(1024,1024).png().toFile(path.join(root,'png',p.id+'.png'));
}
const master={id:'shirt-master',name:'Master după referință',body:'#EEF0F2',collarShape:'v'};
await fs.writeFile(path.join(root,'shirt-master.svg'),renderShirt(master));
await sharp(Buffer.from(renderShirt(master))).resize(1024,1024).png().toFile(path.join(root,'shirt-master.png'));

const example=[presets.find(p=>p.id==='contrast-red-white'),master,presets.find(p=>p.id==='vertical-sky-white')];
const labels=['MÂNECI CONTRASTANTE','MASTER / CONTUR COMUN','DUNGI VERTICALE'];
const cards=example.map((p,i)=>{
 const x=48+i*452;
 return `<rect x="${x}" y="150" width="440" height="592" rx="22" fill="${i===1?'#DCE3E9':'#FFFFFF'}" stroke="#DCE3E9"/><text x="${x+24}" y="186" fill="#667B8E" font-family="DejaVu Sans" font-size="12">${i===1?'REFERINȚĂ / SILUETĂ':'EXEMPLU DE CONFIGURAȚIE'}</text><svg x="${x+5}" y="204" width="430" height="455" viewBox="0 0 512 512" fill="none">${inner(p,'hero-'+i)}</svg><text x="${x+220}" y="703" text-anchor="middle" fill="#24384B" font-family="DejaVu Sans" font-size="13" font-weight="bold">${labels[i]}</text>`;
}).join('');
const preview=`<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="820" viewBox="0 0 1440 820"><rect width="1440" height="820" fill="#F4F6F8"/><text x="48" y="67" font-family="DejaVu Sans" font-size="33" font-weight="bold" fill="#172A3A">Master refăcut după referință</text><text x="48" y="107" font-family="DejaVu Sans" font-size="17" fill="#607488">Umeri rotunjiți, mâneci coborâte, corp mai lung și umbre discrete.</text><text x="1389" y="62" text-anchor="end" font-family="DejaVu Sans" font-size="13" fill="#607488">SVG / REVIZIA 02</text>${cards}<text x="48" y="791" font-family="DejaVu Sans" font-size="14" fill="#607488">Exemple generice. SVG-urile și PNG-urile individuale au fundal transparent.</text></svg>`;
await fs.writeFile(path.join(root,'preview.svg'),preview);
await sharp(Buffer.from(preview)).png().toFile(path.join(root,'preview.png'));

let tiles='';
for(let i=0;i<presets.length;i++){
 const p=presets[i],x=64+i%4*334,y=148+Math.floor(i/4)*350;
 tiles+=`<rect x="${x}" y="${y}" width="310" height="326" rx="18" fill="#172638"/><svg x="${x+19}" y="${y+5}" width="272" height="272" viewBox="0 0 512 512" fill="none">${inner(p,'tile-'+i)}</svg><text x="${x+20}" y="${y+300}" fill="#EDF3F8" font-family="DejaVu Sans" font-size="15">${esc(p.name)}</text>`;
}
const sheet=`<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="920"><rect width="1440" height="920" fill="#0C1826"/><text x="64" y="68" font-family="DejaVu Sans" font-size="34" font-weight="bold" fill="#EDF3F8">Variante pe masterul corectat</text><text x="64" y="106" font-family="DejaVu Sans" font-size="17" fill="#A0B3C7">Aceeași siluetă și poziționare. Culori și modele editabile.</text>${tiles}<text x="64" y="876" font-family="DejaVu Sans" font-size="14" fill="#A0B3C7">Studii generice de culoare și model; fără asociere la echipe verificate.</text></svg>`;
await fs.writeFile(path.join(root,'variants-preview.svg'),sheet);
await sharp(Buffer.from(sheet)).png().toFile(path.join(root,'variants-preview.png'));
console.log('Rendered corrected master, eight PNG variants and two previews.');
