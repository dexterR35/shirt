import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import {tracePatch,placeTrace} from '../scripts/research/tier1-42/trace.mjs';

test('large traced ink paths preserve holes across bands and do not embed reference pixels',async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'kit-ink-test-'));
  const file=path.join(dir,'ring.png');
  try{
    await sharp(Buffer.from('<svg width="80" height="80"><rect width="80" height="80" fill="white"/><path d="M5 5H75V75H5ZM25 25V55H55V25Z" fill="black"/></svg>')).png().toFile(file);
    const trace=await tracePatch({reference:file,box:[0,0,80,80],width:80,mode:'inverse',threshold:128});
    const layers=placeTrace(trace,{x:0,y:0,width:80,color:'#000000'});
    assert.ok(layers.length);assert.ok(layers.every(l=>l.d.length<=20000));
    const svg=`<svg width="80" height="80"><rect width="80" height="80" fill="white"/>${layers.map(l=>`<path d="${l.d}" fill="black"/>`).join('')}</svg>`;
    assert.ok(!svg.includes('<image'));
    const {data,info}=await sharp(Buffer.from(svg)).removeAlpha().raw().toBuffer({resolveWithObject:true});
    const pixel=(x,y)=>data[(y*80+x)*info.channels];
    assert.equal(pixel(40,40),255,'The central cutout must stay unpainted');
    for(const y of [15,24,32,48,64])assert.equal(pixel(12,y),0,'Band splits must not punch gaps in the ink');
    assert.equal(pixel(2,40),255);
  }finally{await fs.unlink(file).catch(()=>{});await fs.rmdir(dir);}
});
