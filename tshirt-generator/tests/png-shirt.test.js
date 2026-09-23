import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
import {PNG_BASE,PNG_PREVIEW,renderColorArtwork,compositePixels} from '../src/lib/png-shirt.js';
import {neutralConfig} from '../src/lib/shirt-renderer.js';

test('deployed PNG remains byte-identical to the full-resolution source',async()=>{
  const a=await fs.readFile('base.png'),b=await fs.readFile('public'+PNG_BASE.path);
  assert.ok(a.equals(b));
  assert.equal(crypto.createHash('sha256').update(b).digest('hex'),PNG_BASE.sha256);
  const meta=await sharp(b).metadata();assert.equal(meta.width,8000);assert.equal(meta.height,5000);
});
test('the 2048 display copy is a lossless crop of the master that keeps the shirt in place',async()=>{
  const opaqueBox=async(input)=>{
    const {data,info}=await sharp(input).ensureAlpha().extractChannel(3).raw().toBuffer({resolveWithObject:true});
    let x0=Infinity,y0=Infinity,x1=-1,y1=-1;
    for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[y*info.width+x]>127){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
    return {x0,y0,x1,y1,info};
  };
  const preview=await opaqueBox('public'+PNG_PREVIEW.path),master=await opaqueBox('base.png');
  assert.equal(preview.info.width,2048);assert.equal(preview.info.height,2048);
  assert.equal((await sharp('public'+PNG_PREVIEW.path).metadata()).format,'webp');
  // Map master pixels -> 200 units -> preview pixels; the outline must agree within 2 preview pixels.
  const toPreview=(v,axis)=>((v-PNG_BASE[axis])/PNG_BASE.scale)*(PNG_PREVIEW.span/200)+PNG_PREVIEW[axis];
  for(const [key,axis] of [['x0','x'],['x1','x'],['y0','y'],['y1','y']])
    assert.ok(Math.abs(toPreview(master[key],axis)-preview[key])<=2,`${key} ${toPreview(master[key],axis)} vs ${preview[key]}`);
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
