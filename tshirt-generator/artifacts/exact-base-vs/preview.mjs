import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import sharp from 'sharp';
const browser=await chromium.launch({headless:true});const page=await browser.newPage();await page.goto('http://localhost:5173/studio');
const images=await page.evaluate(async()=>{
 const {renderPngPreview}=await import('/src/lib/png-preview.js');
 const {paintArea}=await import('/src/lib/composite.js');
 const size=2048, source=await renderPngPreview(null,size,{view:'front'}),{margin,span}=paintArea(size);
 const render=(flipped)=>{
  const c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d');const out=ctx.createImageData(size,size);
  for(let x=0;x<size;x++){
   let u=((x+.5-margin)/span)*200;if(flipped)u=200-u;
   const dx=(u-100)/(.93*.82),sx=dx/(1-.16*dx/100),den=1+.16*sx/100;
   const px=margin+((sx+100)/200)*span-.5;
   if(px<0||px>=size-1)continue;const x0=Math.floor(px),fx=px-x0;
   for(let y=0;y<size;y++){
    const v=(y+.5-margin)/span*200,sy=100+(v-100)*den/.93,py=margin+sy/200*span-.5;
    if(py<0||py>=size-1)continue;const y0=Math.floor(py),fy=py-y0;
    const ids=[(y0*size+x0)*4,(y0*size+x0+1)*4,((y0+1)*size+x0)*4,((y0+1)*size+x0+1)*4];
    const weights=[(1-fx)*(1-fy),fx*(1-fy),(1-fx)*fy,fx*fy],p=(y*size+x)*4;
    let a=0;for(let i=0;i<4;i++)a+=source.data[ids[i]+3]*weights[i];if(a===0)continue;
    out.data[p+3]=Math.round(a);for(let k=0;k<3;k++){let sum=0;for(let i=0;i<4;i++)sum+=source.data[ids[i]+k]*source.data[ids[i]+3]*weights[i];out.data[p+k]=Math.round(sum/a);}
   }
  }
  ctx.putImageData(out,0,0);return c.toDataURL();
 };
 return [render(false),render(true)];
});
for(const[i,data]of images.entries())await fs.writeFile(`artifacts/exact-base-vs/${i?'away-left':'home-right'}.png`,Buffer.from(data.split(',')[1],'base64'));
const names=['home-right','away-left'];const layers=await Promise.all(names.map(async(name,i)=>({input:await sharp(`artifacts/exact-base-vs/${name}.png`).resize(700,700).png().toBuffer(),left:i*520,top:50})));
const text=Buffer.from('<svg width="1220" height="780"><g fill="#DDE7F3" font-family="sans-serif" text-anchor="middle"><text x="350" y="45" font-size="20">HOME · faces right</text><text x="870" y="45" font-size="20">AWAY · faces left</text><text x="610" y="400" font-size="34" font-weight="bold">VS</text><text x="610" y="757" font-size="17">Exact original PNG · perspective only · no reconstructed side fabric</text></g></svg>');
await sharp({create:{width:1220,height:780,channels:4,background:'#0C192C'}}).composite([...layers,{input:text}]).png().toFile('artifacts/exact-base-vs/preview.png');
await browser.close();console.log('Exact-base VS preview created.');
