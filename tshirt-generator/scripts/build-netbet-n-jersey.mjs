import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { zipSync } from 'fflate';
import { PNG_BASE, PNG_PREVIEW, renderColorArtwork, compositePixels } from '../src/lib/png-shirt.js';
import { netbetNJerseyConfig } from '../src/lib/generic-jersey-netbet-n.js';
import { buildNetbetProof } from './netbet-n-jersey-proofs.mjs';

const out = 'artifacts/generic-jersey/r004';
await fs.mkdir(`${out}/assets`, { recursive: true });
await fs.mkdir(`${out}/editable-paint`, { recursive: true });
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const source = await fs.readFile('base.png');
assert.equal(hash(source), PNG_BASE.sha256);
const { left, top, side } = PNG_PREVIEW.crop;
const raw = await sharp(source).extract({ left, top, width: side, height: side }).ensureAlpha().raw().toBuffer();
const sizes = [24,32,40,48,64,80,96,128,160,168,256,336,512];
const manifest = { revision: 'r004', status: 'awaiting-UX-review', design: 'Rounded N motif with green and dark-green paint only', source: { file: 'base.png', sha256: PNG_BASE.sha256, width: 8000, height: 5000 }, assets: [], checks: {} };
const previews = {};
async function saveAsset(file, bytes, width, height) {
  await fs.writeFile(`${out}/${file}`, bytes);
  manifest.assets.push({ file, width, height, bytes: bytes.length, sha256: hash(bytes) });
}
for (const surface of ['on-dark','on-light']) {
  const config = netbetNJerseyConfig(surface), svg = renderColorArtwork(config);
  await fs.writeFile(`${out}/editable-paint/${surface}.config.json`, JSON.stringify(config,null,2)+'\n');
  await fs.writeFile(`${out}/editable-paint/${surface}.svg`, svg);
  const registered = svg.replace(/width="200" height="200" viewBox="0 0 200 200"/, `width="${side}" height="${side}" viewBox="${left} ${top} ${side} ${side}"`).replace('<defs>', `<g transform="translate(${PNG_BASE.x} ${PNG_BASE.y}) scale(${PNG_BASE.scale})"><defs>`).replace('</svg>','</g></svg>');
  const paint = await sharp(Buffer.from(registered)).ensureAlpha().raw().toBuffer();
  const pixels = compositePixels(raw, paint);
  let changed = 0;
  for (let i=0;i<raw.length;i+=4) {
    assert.equal(pixels[i+3],raw[i+3]);
    if (raw[i+3] && pixels[i]!==raw[i]) changed++;
  }
  assert.ok(changed > 100000, 'Paint must visibly change the source');
  const raster = () => sharp(pixels, { raw: { width: side, height: side, channels: 4 } });
  const master = await raster().extend({ left, top, right:8000-left-side, bottom:5000-top-side, background:{r:0,g:0,b:0,alpha:0} }).png({compressionLevel:9}).toBuffer();
  assert.ok((await sharp(master).extractChannel('alpha').raw().toBuffer()).equals(await sharp(source).extractChannel('alpha').raw().toBuffer()), '8K master alpha must match the original');
  await saveAsset(`assets/jersey-generic-netbet-${surface}-r004-master-8000x5000.png`,master,8000,5000);
  for (const size of sizes) {
    const png = await raster().resize(size,size).png({compressionLevel:9}).toBuffer();
    const webp = await sharp(png).webp({lossless:true,effort:6}).toBuffer();
    const a=await sharp(png).ensureAlpha().raw().toBuffer(), b=await sharp(webp).ensureAlpha().raw().toBuffer();
    for(let i=0;i<a.length;i+=4) { assert.equal(a[i+3],b[i+3]); if(a[i+3]) for(let c=0;c<3;c++) assert.equal(a[i+c],b[i+c]); }
    await saveAsset(`assets/jersey-generic-netbet-${surface}-r004-${size}.png`,png,size,size);
    await saveAsset(`assets/jersey-generic-netbet-${surface}-r004-${size}.webp`,webp,size,size);
    previews[`${surface}-${size}`]=png;
  }
}
const text=(x,y,size,value,fill='#A8B3C4')=>`<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" fill="${fill}">${value}</text>`;
let board=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="910"><rect width="1200" height="910" fill="#092E28"/>${text(48,50,14,'NETBET SPORT / DEFAULT JERSEY / r004')}${text(48,101,34,'The N motif. Green on dark green.','#F6F7FA')}${text(48,135,15,'Rounded N chest paint · green sleeves and collar · original 8K fabric')}`;
board+='<rect x="48" y="168" width="540" height="580" rx="18" fill="#103D34"/><rect x="612" y="168" width="540" height="580" rx="18" fill="#FFFFFF"/>';
const layers=[];
for(const [i,surface] of ['on-dark','on-light'].entries()) {
  const x=48+i*564, ink=i?'#56687A':'#A8B3C4';
  board+=text(x+24,201,14,i?'FOR LIGHT BACKGROUNDS':'FOR DARK BACKGROUNDS',ink);
  layers.push({input:previews[`${surface}-336`],left:x+102,top:220});
  for(const [j,size] of [24,32,40,48,64,80].entries()) {
    const px=x+20+j*83;
    layers.push({input:previews[`${surface}-${size}`],left:px+Math.round((80-size)/2),top:600+80-size});
    board+=text(px+24,710,12,`${size} px`,ink);
  }
}
board+=text(48,792,16,'Paint is editable vector geometry, multiplied with the original 8K fabric RGB and alpha.')+text(48,826,14,'Transparent PNG / lossless WebP + 8000 × 5000 PNG masters. User-requested N motif. No club emblems or national flags.')+text(48,861,14,'New r004 artwork; r001–r003 preserved. UX Lead review pending. No Figma or fallback implementation.')+'</svg>';
await sharp(Buffer.from(board)).composite(layers).png().toFile(`${out}/review-board.png`);
await buildNetbetProof(out);
await fs.writeFile(`${out}/reference-evidence.json`, JSON.stringify({reference:'User-supplied rounded N motif, 13 October 2026', file:'references/netbet-n-motif-2026-10-13.png', request:'Add the N motif; remove navy/purple and keep green and dark green only.', paletteNote:'Two adapted green paint colours per surface. Fabric provides shading; no official token claim.', referenceSHA256:hash(await fs.readFile('references/netbet-n-motif-2026-10-13.png'))},null,2)+'\n');
manifest.checks={sourceHash:'pass',nativeAlpha:'identical',master8KAlpha:'identical',pngWebpVisiblePixels:'identical',validatedVectorLayers:3,assetCount:manifest.assets.length};
await fs.writeFile(`${out}/manifest.json`,JSON.stringify(manifest,null,2)+'\n');
await fs.writeFile(`${out}/ASSET-SPEC.txt`, await fs.readFile('docs/GENERIC_JERSEY_R004_SPEC.txt','utf8'));
const files={};
async function collect(dir,prefix='') { for(const entry of await fs.readdir(dir,{withFileTypes:true})) { const relative=prefix+entry.name; if(entry.isDirectory()) await collect(`${dir}/${entry.name}`,relative+'/'); else files[relative]=new Uint8Array(await fs.readFile(`${dir}/${entry.name}`)); } }
await collect(out);
await fs.writeFile('artifacts/generic-jersey/netbet-generic-jersey-r004.zip',zipSync(files,{level:6}));
const frontendAssets=manifest.assets.filter(asset=>!asset.file.includes('-master-'));
const frontendFiles=Object.fromEntries(frontendAssets.map(asset=>[asset.file,files[asset.file]]));
frontendFiles['manifest.json']=Buffer.from(JSON.stringify({...manifest,distribution:'frontend',assets:frontendAssets,checks:{...manifest.checks,assetCount:frontendAssets.length}},null,2)+'\n');
frontendFiles['ASSET-SPEC.txt']=files['ASSET-SPEC.txt'];
frontendFiles['README.txt']=Buffer.from('Frontend review package: 52 transparent PNG/WebP assets and usage specifications.\n8K masters, editable paint and proofs are in netbet-generic-jersey-r004.zip.\nUX Lead approval and raster-format agreement are pending; no release approval is implied.\n');
await fs.writeFile('artifacts/generic-jersey/netbet-generic-jersey-frontend-r004.zip',zipSync(frontendFiles,{level:6}));
console.log(JSON.stringify({out,checks:manifest.checks},null,2));
