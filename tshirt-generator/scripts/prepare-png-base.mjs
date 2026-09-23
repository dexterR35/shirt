import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
import {PNG_BASE,PNG_PREVIEW} from '../src/lib/png-shirt.js';

const input=await fs.readFile('base.png');
const hash=crypto.createHash('sha256').update(input).digest('hex');
const metadata=await sharp(input).metadata();
if(hash!==PNG_BASE.sha256 || metadata.width!==PNG_BASE.width || metadata.height!==PNG_BASE.height)throw Error('Base PNG changed: inspect the replacement and update its paint mapping explicitly.');
const dir='public/assets/base';
await fs.mkdir(dir,{recursive:true});
// Remove masters/previews with stale content names; the current names are rewritten below.
for(const file of await fs.readdir(dir))if(/^(source|preview)[-.]/.test(file))await fs.rm(`${dir}/${file}`);
await fs.writeFile('public'+PNG_BASE.path,input);
const {left,top,side}=PNG_PREVIEW.crop;
await sharp(input).extract({left,top,width:side,height:side})
  .resize(PNG_PREVIEW.size,PNG_PREVIEW.size,{kernel:'lanczos3'})
  .webp({lossless:true,effort:6})
  .toFile('public'+PNG_PREVIEW.path);
await fs.writeFile(`${dir}/manifest.json`,JSON.stringify({...PNG_BASE,preview:PNG_PREVIEW,source:'base.png',method:'Unmodified PNG master; lossless 2048 WebP crop for display; editable SVG paint multiplied into source RGB, original alpha preserved.'},null,2)+'\n');
console.log(`Preserved original ${metadata.width} × ${metadata.height} PNG: ${hash}; preview ${PNG_PREVIEW.size} × ${PNG_PREVIEW.size} WebP`);
