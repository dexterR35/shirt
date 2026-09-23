import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import {kitPreviewConfig, validatePngLayout} from '../src/lib/png-layout.js';
import {renderColorArtwork} from '../src/lib/png-shirt.js';
import {neutralConfig} from '../src/lib/shirt-renderer.js';
const read = async path => JSON.parse(await fs.readFile(path,'utf8'));
const leedsPath = 'data/kits/png-layouts/team_8eeab14d44ff8cd2c539-home-p001.json';

test('every available kit resolves its separate reviewed PNG layout while retaining archival config',async()=>{
  const manifest = await read('public/catalog/manifest.json');
  let count=0;
  for(const team of manifest.teams)for(const [variant,slot] of Object.entries(team.kits)){
    if(slot.status!=='ready')continue;
    const item={...slot,team_id:team.id,variant},details=await read('public'+slot.details_path);
    const parent=await read(`data/kits/${team.id}-${variant}-${slot.revision}.json`);
    assert.deepEqual(details.config,parent.config);
    const config=kitPreviewConfig(details,item);
    assert.equal(config.templateVersion,'png-front-1');
    if(details.config.templateVersion!=='png-front-1')assert.notDeepEqual(config,details.config);
    else assert.deepEqual(config,details.config,'New PNG-native configurations use their reviewed paint unchanged');
    await sharp(Buffer.from(renderColorArtwork(config))).png().toBuffer();
    count++;
  }
  assert.equal(count,manifest.counts.ready);
  assert.ok(count>=15,'Previously available kits are retained');
});

test('all eight V/polo corrections retain the kit artwork and recolor only the base neckline',async()=>{
  const candidates=(await fs.readdir('data/kits/png-layouts')).filter(f=>f.endsWith('-p002.json'));
  const files=[];
  for(const file of candidates){
    const layout=await read('data/kits/png-layouts/'+file);
    if(layout.review_scope?.startsWith('Collar colors follow only the sewn round neckline'))files.push(file);
  }
  assert.equal(files.length,8);
  for(const file of files){
    const current=await read('data/kits/png-layouts/'+file);
    const previous=await read('data/kits/png-layouts/'+file.replace('-p002','-p001'));
    assert.deepEqual(current.config.layers,previous.config.layers);
    assert.deepEqual(current.config.detailLayers,previous.config.detailLayers);
    assert.equal(current.status,'reviewed');
    assert.ok(current.config.collar.layers.every(l=>l.id.startsWith('base-')));
    const data=await sharp(Buffer.from(renderColorArtwork({...neutralConfig('#FFFFFF'),templateVersion:'png-front-1',collar:current.config.collar}))).resize(200,200).ensureAlpha().raw().toBuffer();
    // The old V reached y=31, and polo plackets reached y=36.
    for(let y=27;y<40;y++)for(let x=65;x<135;x++)assert.deepEqual([...data.subarray((y*200+x)*4,(y*200+x)*4+3)],[255,255,255]);
  }
});

test('collar paint is bounded to the existing neck even with oversized custom layers',async()=>{
  const config={...neutralConfig('#FFFFFF'),templateVersion:'png-front-1',collar:{shape:'custom',layers:[{type:'rect',x:0,y:0,width:200,height:200,fill:'#FF0000',clip:'all'}]}};
  const data=await sharp(Buffer.from(renderColorArtwork(config))).ensureAlpha().raw().toBuffer();
  const pixel=(x,y)=>[...data.subarray((y*200+x)*4,(y*200+x)*4+3)];
  assert.deepEqual(pixel(100,22),[255,0,0]);
  for(const [x,y] of [[100,30],[68,20],[132,20],[100,100]])assert.deepEqual(pixel(x,y),[255,255,255]);
});

test('missing, mismatched or unreviewed layouts fail instead of silently applying another configuration',async()=>{
  const layout=await read(leedsPath);
  const parent=await read(`data/kits/${layout.team_id}-${layout.variant}-${layout.source_revision}.json`);
  const item={...parent,png_layout_revision:'p001'};
  assert.throws(()=>kitPreviewConfig(parent,item),/missing/);
  assert.throws(()=>validatePngLayout({...layout,status:'draft'},parent));
  assert.throws(()=>validatePngLayout({...layout,source_revision:'r999'},parent));
  assert.throws(()=>validatePngLayout({...layout,team_id:'another-team'},parent));
  assert.throws(()=>kitPreviewConfig({...parent,png_layout:layout},{...item,png_layout_revision:'p002'}));
  assert.deepEqual(kitPreviewConfig(parent,parent),parent.config);
});

test('Leeds renders two shoulder tapes and visible collar/cuff edges above base paint',async()=>{
  const {config}=await read(leedsPath);
  const raster=async c=>sharp(Buffer.from(renderColorArtwork(c))).resize(1000,1000).ensureAlpha().raw().toBuffer();
  const data=await raster(config);
  const pixel=(pixels,x,y)=>[...pixels.subarray((Math.floor(y*5)*1000+Math.floor(x*5))*4,(Math.floor(y*5)*1000+Math.floor(x*5))*4+3)];
  for(const side of ['left','right']){
    let count=0,previous=false;
    for(let x=20;x<50;x+=.2){
      const [r,g,b]=pixel(data,side==='left'?x:200-x,22),blue=b>r*1.6&&b>g*1.25;
      if(blue&&!previous)count++;
      previous=blue;
    }
    assert.equal(count,2,`${side} shoulder has two separated tapes`);
  }
  for(const [x,y] of [[25,80.5],[175,80.5],[100,19]]){
    const [r,g,b]=pixel(data,x,y);
    assert.ok(r>b*2&&g>b*2,'yellow edging remains visible');
  }
  const custom=structuredClone(config);
  custom.colors.collar='#D02050';custom.colors.leftCuff='#D02050';
  const painted=await raster(custom);
  assert.deepEqual(pixel(painted,100,22),[208,32,80]);
  assert.deepEqual(pixel(painted,25,78),[208,32,80]);
  assert.deepEqual(pixel(painted,100,19),pixel(data,100,19),'contrast trim retained');
});
