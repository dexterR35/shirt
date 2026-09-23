import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
import {renderShirt, neutralConfig, SURFACE_VERSION} from '../src/lib/shirt-renderer.js';
import {NEW_BASE_SHA256} from '../src/lib/generated/new-base-surface.js';

test('the default master comes from the replacement PNG and all supplied copies agree', async()=>{
  for(const path of ['base.png','starter/shirt-svg/base.png','starter/shirt-svg/png/base.png']){
    const hash=crypto.createHash('sha256').update(await fs.readFile(path)).digest('hex');
    assert.equal(hash,NEW_BASE_SHA256);
  }
  const svg=renderShirt(neutralConfig());
  assert.ok(svg.includes(NEW_BASE_SHA256));
  assert.ok(svg.includes(SURFACE_VERSION));
  assert.ok(svg.includes('replacement-front-3'));
  assert.doesNotMatch(svg,/<image|data:image|original-light-interpolation|crispEdges/);
});

test('new vector silhouette and shading match the independently normalized replacement',async()=>{
  const input=await sharp('base.png').extract({left:2343,top:611,width:3314,height:3779}).resize(516,588).extend({left:42,right:42,top:6,bottom:6,background:'#00000000'}).ensureAlpha().raw().toBuffer();
  const svg=renderShirt(neutralConfig()).replace('width="512" height="512" viewBox="0 0 512 512"','width="600" height="600" viewBox="0 0 200 200"').replace('transform="translate(32 32) scale(2.24)"','');
  const actual=await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer();
  let union=0,intersection=0,error=0,pixels=0;
  for(let i=0;i<input.length;i+=4){
    const a=input[i+3]>=128,b=actual[i+3]>=128;
    if(a||b)union++;if(a&&b)intersection++;
    if(input[i+3]===255&&actual[i+3]===255){error+=Math.abs(actual[i]-input[i]);pixels++;}
  }
  assert.ok(intersection/union>.99,`Silhouette overlap ${intersection/union}`);
  assert.ok(error/pixels<7,`Mean shading error ${error/pixels}/255`);
});
