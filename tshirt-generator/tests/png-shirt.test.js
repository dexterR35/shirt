import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
import {PNG_BASE,renderColorArtwork,compositePixels} from '../src/lib/png-shirt.js';
import {neutralConfig} from '../src/lib/shirt-renderer.js';

test('deployed PNG remains byte-identical to the full-resolution source',async()=>{
  const a=await fs.readFile('base.png'),b=await fs.readFile('public'+PNG_BASE.path);
  assert.ok(a.equals(b));
  assert.equal(crypto.createHash('sha256').update(b).digest('hex'),PNG_BASE.sha256);
  const meta=await sharp(b).metadata();assert.equal(meta.width,8000);assert.equal(meta.height,5000);
});
test('white paint is lossless and colored paint preserves every alpha value and texture variation',async()=>{
  const source=await sharp('base.png').extract({left:2900,top:1900,width:256,height:256}).ensureAlpha().raw().toBuffer();
  const white=new Uint8ClampedArray(source.length).fill(255);
  assert.deepEqual(Buffer.from(compositePixels(source,white)),source);
  const color=Uint8ClampedArray.from(white,(_,i)=>[220,30,65,255][i%4]);
  const result=compositePixels(source,color);
  for(let i=0;i<source.length;i+=4){
    assert.equal(result[i+3],source[i+3]);
    assert.equal(result[i],Math.round(source[i]*220/255));
  }
  const edge=new Uint8ClampedArray([200,210,220,0,230,240,250,64,250,240,230,255]);
  const painted=compositePixels(edge,new Uint8ClampedArray(edge.length).fill(128));
  assert.deepEqual([painted[3],painted[7],painted[11]],[0,64,255]);
});
test('all saved team configurations supply validated paint without baked fabric shading',async()=>{
  for(const file of (await fs.readdir('data/kits')).filter(f=>f.endsWith('.json'))){
    const {config}=JSON.parse(await fs.readFile('data/kits/'+file,'utf8'));
    const svg=renderColorArtwork(config);
    assert.doesNotMatch(svg,/<image|<filter|data:image|<script|href=/);
    await sharp(Buffer.from(svg)).png().toBuffer();
  }
  assert.throws(()=>renderColorArtwork({...neutralConfig(),layers:[{type:'image',fill:'#ffffff',clip:'all'}]}));
});
