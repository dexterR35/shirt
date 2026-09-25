import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import sharp from 'sharp';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1500,height:1000}});
page.on('pageerror',e=>console.log('PAGE ERROR',e.message));
await page.goto('http://localhost:5173/studio');
const names=['Arsenal','Barcelona','AEK Athens','Ajax','Celtic','parts'];const shots=[];
for(let i=0;i<names.length;i++)for(const [j,view] of ['front','three-quarter'].entries()){
 const r=await page.evaluate(async({name,view})=>{
  const {renderPngPreview}=await import('/src/lib/png-preview.js');
  const {neutralConfig}=await import('/src/lib/shirt-renderer.js');
  const {loadKit}=await import('/src/lib/kit-config.js');
  const {kitItem}=await import('/src/lib/catalog.js');
  let config;
  if(name==='parts'){
   config=neutralConfig('#4679EE');
   Object.assign(config.colors,{leftSleeve:'#28C987',rightSleeve:'#FFAD27',leftCuff:'#63E6FF',rightCuff:'#E673C5',collar:'#E53645'});
  }else{
   const t=(await fetch('/catalog/manifest.json').then(r=>r.json())).teams.find(t=>t.name===name);
   ({config}=await loadKit(kitItem(t,name==='Ajax'?'away':'home')));
  }
  const px=await renderPngPreview(config,1024,{view});
  const c=document.createElement('canvas');c.width=c.height=1024;c.getContext('2d').putImageData(px,0,0);return c.toDataURL();
 },{name:names[i],view});
 const p=`artifacts/three-quarter/${names[i]}-${view}.png`;
 await fs.writeFile(p,Buffer.from(r.split(',')[1],'base64'));
 shots.push({input:await sharp(p).resize(420,420).toBuffer(),left:j*420,top:i*420});
}
await sharp({create:{width:840,height:2520,channels:4,background:'#16243a'}}).composite(shots).png().toFile('artifacts/three-quarter/comparison.png');
await browser.close();console.log('Render checks ready.');
