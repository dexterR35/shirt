import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { unzipSync } from 'fflate';
import { perspectivePoint, perspectiveSource, perspectivePixels, facingForVariant } from '../src/lib/perspective-shirt.js';
import { validateShirtView } from '../src/lib/shirt-view.js';
import { exportFilename, zipFilename } from '../src/lib/export.js';
import { renderTier1Zip } from '../src/lib/tier1-export.js';

test('original high-resolution base is unchanged', () => {
  const hash=createHash('sha256').update(readFileSync('starter/shirt-svg/base.png')).digest('hex');
  assert.equal(hash,'4670b8b8dd8d66d22a4b5313aac9e5406d9c0913244a72bdcebe41e347637042');
});

test('inward Home/Away perspectives preserve straight stripes and invert for editing', () => {
  assert.equal(facingForVariant('home'),'right');assert.equal(facingForVariant('away'),'left');
  for (const facing of ['right','left']) for (const line of [[[75,25],[75,190]],[[40,85],[160,85]],[[50,35],[140,185]]]) {
    const [a,b]=line.map(p=>perspectivePoint(...p,facing));
    for(let t=0;t<=1;t+=.1){
      const original=line[0].map((v,i)=>v+(line[1][i]-v)*t), p=perspectivePoint(...original,facing);
      assert.ok(Math.abs((p[0]-a[0])*(b[1]-a[1])-(p[1]-a[1])*(b[0]-a[0]))<1e-8);
      const restored=perspectiveSource(...p,facing);
      assert.ok(restored.every((v,i)=>Math.abs(v-original[i])<1e-10));
    }
  }
});

test('opposing views mirror all pixels; transparency never introduces a dark fringe', () => {
  const size=128, source=new Uint8ClampedArray(size*size*4);
  for(let y=12;y<114;y++)for(let x=35;x<91;x++)source.set([210,70,30,x===35?80:255],(y*size+x)*4);
  const right=perspectivePixels(source,size),left=perspectivePixels(source,size,{facing:'left'});
  let visible=0,soft=0;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++) {
    const p=(y*size+x)*4,mirror=(y*size+size-1-x)*4;
    for(let k=0;k<4;k++)assert.ok(Math.abs(right[p+k]-left[mirror+k])<=1);
    if(right[p+3]){visible++;assert.deepEqual([...right.subarray(p,p+3)],[210,70,30]);}
    if(right[p+3]>0&&right[p+3]<255)soft++;
  }
  assert.ok(visible>1000&&soft>20);assert.equal(right[3],0);
  assert.throws(()=>perspectivePixels(source,size,{facing:'up'}),/left or right/);
});

test('angled files and bulk ZIPs keep each variant and its facing direction', async () => {
  assert.throws(()=>validateShirtView('side'),/Front or Angled/);
  const home={team_name:'Arsenal',country_name:'England',team_id:'test',kit_season:'2026/27',variant:'home',revision:'r001'};
  assert.match(exportFilename(home,168,'png',false,'1:1','three-quarter'),/-168px-angled\.png$/);
  assert.equal(zipFilename(2,168,'png','1:1','three-quarter'),'tshirt-kits-2-168px-angled-png.zip');
  const seen=[];
  const zip=await renderTier1Zip([home,{...home,variant:'away'}],{size:168,view:'three-quarter',load:async()=>({config:{}}),render:async(...args)=>{seen.push(args.slice(5));return new Blob(['test png']);}});
  assert.deepEqual(seen,[['three-quarter','right'],['three-quarter','left']]);
  assert.deepEqual(Object.keys(unzipSync(new Uint8Array(await zip.arrayBuffer()))),['arsenal_home-angled.png','arsenal_away-angled.png']);
});
