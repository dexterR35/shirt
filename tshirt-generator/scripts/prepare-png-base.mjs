import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
import {PNG_BASE} from '../src/lib/png-shirt.js';

const input=await fs.readFile('base.png');
const hash=crypto.createHash('sha256').update(input).digest('hex');
const metadata=await sharp(input).metadata();
if(hash!==PNG_BASE.sha256 || metadata.width!==PNG_BASE.width || metadata.height!==PNG_BASE.height)throw Error('Base PNG changed: inspect the replacement and update its paint mapping explicitly.');
await fs.mkdir('public/assets/base',{recursive:true});
await fs.writeFile('public'+PNG_BASE.path,input);
await fs.writeFile('public/assets/base/manifest.json',JSON.stringify({...PNG_BASE,source:'base.png',method:'Unmodified PNG; editable SVG paint multiplied into source RGB, original alpha preserved.'},null,2)+'\n');
console.log(`Preserved original ${metadata.width} × ${metadata.height} PNG: ${hash}`);
