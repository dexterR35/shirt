import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { unzipSync } from 'fflate';
import { QUARTER_BASE, projectQuarterBody } from '../src/lib/quarter-shirt.js';
import { validateShirtView } from '../src/lib/shirt-view.js';
import { exportFilename, zipFilename } from '../src/lib/export.js';
import { renderTier1Zip } from '../src/lib/tier1-export.js';

test('selected ¾ template is preserved with real alpha; front base bytes are unchanged', async () => {
  const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
  const source=readFileSync('data/base-views/three-quarter/neutral-v1.png');
  assert.equal(hash(source),'a3bb5857646917f7cf33ec37638f26022d0a5501587d0ed174a0321b74169872');
  assert.equal(hash(readFileSync('starter/shirt-svg/base.png')),'4670b8b8dd8d66d22a4b5313aac9e5406d9c0913244a72bdcebe41e347637042');
  const decoded=await sharp('public'+QUARTER_BASE.path).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const original=await sharp(source).ensureAlpha().raw().toBuffer();
  assert.equal(decoded.info.width,QUARTER_BASE.width);assert.equal(decoded.info.height,QUARTER_BASE.height);
  let transparent=0,opaque=0;
  for(let i=0;i<original.length;i+=4){
    assert.equal(decoded.data[i+3],original[i+3]);
    if(original[i+3]===0)transparent++;
    if(original[i+3]===255)opaque++;
    if(original[i+3])assert.deepEqual(decoded.data.subarray(i,i+3),original.subarray(i,i+3));
  }
  assert.ok(transparent>200000&&opaque>200000);
});

test('body perspective preserves straight stripes, hoops and diagonals', () => {
  for(const line of [[[75,25],[75,190]],[[40,85],[160,85]],[[50,35],[140,185]]]){
    const [a,b]=line.map(p=>projectQuarterBody(...p));
    for(let t=0;t<=1;t+=.1){
      const p=projectQuarterBody(...line[0].map((v,i)=>v+(line[1][i]-v)*t));
      assert.ok(Math.abs((p[0]-a[0])*(b[1]-a[1])-(p[1]-a[1])*(b[0]-a[0]))<1e-8);
    }
  }
});

test('¾ exports carry the angle in names and forward it through bulk rendering', async () => {
  assert.throws(()=>validateShirtView('side'),/Front or ¾/);
  const item={team_name:'Arsenal',country_name:'England',team_id:'test',kit_season:'2026/27',variant:'home',revision:'r001'};
  assert.match(exportFilename(item,168,'png',false,'1:1','three-quarter'),/-168px-three-quarter\.png$/);
  assert.equal(zipFilename(1,168,'png','1:1','three-quarter'),'tshirt-kits-1-168px-three-quarter-png.zip');
  let seen;
  const zip=await renderTier1Zip([item],{size:168,view:'three-quarter',load:async()=>({config:{}}),render:async(...args)=>{seen=args;return new Blob(['test png']);}});
  assert.equal(seen[5],'three-quarter');
  assert.deepEqual(Object.keys(unzipSync(new Uint8Array(await zip.arrayBuffer()))),['arsenal_home-three-quarter.png']);
});
