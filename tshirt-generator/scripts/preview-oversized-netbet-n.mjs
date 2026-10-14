import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { netbetNJerseyConfig } from '../src/lib/generic-jersey-netbet-n.js';
import { validateConfig } from '../src/lib/shirt-renderer.js';
import { PNG_BASE, PNG_PREVIEW, renderColorArtwork, compositePixels } from '../src/lib/png-shirt.js';

// New placement proposal; r004 and its production exports remain untouched.
const out = 'artifacts/generic-jersey/r005-preview';
await fs.mkdir(out, { recursive:true });
const config = netbetNJerseyConfig('on-dark');
const motif = config.layers.find(layer=>layer.id==='rounded-n-motif');
let index=0;
motif.d=motif.d.replace(/-?\d+(?:\.\d+)?/g, value=> {
  const x=index++ % 2===0;
  return String(Number((((Number(value)-(x?54:60))/0.46)*0.94+(x?20:5)).toFixed(3)));
});
validateConfig(config);
const source=await fs.readFile('base.png');
assert.equal(crypto.createHash('sha256').update(source).digest('hex'),PNG_BASE.sha256);
const {left,top,side}=PNG_PREVIEW.crop;
const raw=await sharp(source).extract({left,top,width:side,height:side}).ensureAlpha().raw().toBuffer();
const svg=renderColorArtwork(config);
const registered=svg.replace(/width="200" height="200" viewBox="0 0 200 200"/,`width="${side}" height="${side}" viewBox="${left} ${top} ${side} ${side}"`).replace('<defs>',`<g transform="translate(${PNG_BASE.x} ${PNG_BASE.y}) scale(${PNG_BASE.scale})"><defs>`).replace('</svg>','</g></svg>');
const paint=await sharp(Buffer.from(registered)).ensureAlpha().raw().toBuffer();
const pixels=compositePixels(raw,paint);
for(let i=3;i<raw.length;i+=4) assert.equal(pixels[i],raw[i]);
const png=await sharp(pixels,{raw:{width:side,height:side,channels:4}}).resize(1024,1024).png().toBuffer();
await fs.writeFile(`${out}/jersey-oversized-n.png`,png);
await fs.writeFile(`${out}/paint.config.json`,JSON.stringify(config,null,2)+'\n');
await fs.writeFile(`${out}/paint.svg`,svg);
const canvas=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200"><rect width="1200" height="1200" fill="#F3F5F4"/><text x="60" y="67" fill="#174A3E" font-family="Arial,sans-serif" font-size="20">NETBET SPORT · OVERSIZED N · PLACEMENT PREVIEW</text><text x="60" y="1150" fill="#174A3E" font-family="Arial,sans-serif" font-size="18">Shoulder to hem · green + dark green · original 8K fabric</text></svg>');
await sharp(canvas).composite([{input:png,left:88,top:88}]).png().toFile(`${out}/reference.png`);
console.log('r005 reference image exported; original alpha verified.');
