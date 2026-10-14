import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { zipSync } from 'fflate';
import { PNG_BASE, PNG_PREVIEW, renderColorArtwork, compositePixels } from '../src/lib/png-shirt.js';
import { paintedGenericJerseyConfig } from '../src/lib/generic-jersey-painted.js';

const out = 'artifacts/generic-jersey/r002';
await fs.mkdir(`${out}/assets`, { recursive: true });
await fs.mkdir(`${out}/editable-paint`, { recursive: true });
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const source = await fs.readFile('base.png');
assert.equal(hash(source), PNG_BASE.sha256);
const { left, top, side } = PNG_PREVIEW.crop;
const raw = await sharp(source).extract({ left, top, width: side, height: side }).ensureAlpha().raw().toBuffer();
const sizes = [24,32,40,48,64,80,96,128,160,168,256,336,512];
const manifest = { revision: 'r002', status: 'awaiting-UX-review', design: 'Neutral geometric paint on original 8K fabric', source: { file: 'base.png', sha256: PNG_BASE.sha256, width: 8000, height: 5000 }, assets: [], checks: {} };
const previews = {};
async function saveAsset(file, bytes, width, height) {
  await fs.writeFile(`${out}/${file}`, bytes);
  manifest.assets.push({ file, width, height, bytes: bytes.length, sha256: hash(bytes) });
}
for (const surface of ['on-dark','on-light']) {
  const config = paintedGenericJerseyConfig(surface), svg = renderColorArtwork(config);
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
  await saveAsset(`assets/jersey-generic-painted-${surface}-r002-master-8000x5000.png`,master,8000,5000);
  for (const size of sizes) {
    const png = await raster().resize(size,size).png({compressionLevel:9}).toBuffer();
    const webp = await sharp(png).webp({lossless:true,effort:6}).toBuffer();
    const a=await sharp(png).ensureAlpha().raw().toBuffer(), b=await sharp(webp).ensureAlpha().raw().toBuffer();
    for(let i=0;i<a.length;i+=4) { assert.equal(a[i+3],b[i+3]); if(a[i+3]) for(let c=0;c<3;c++) assert.equal(a[i+c],b[i+c]); }
    await saveAsset(`assets/jersey-generic-painted-${surface}-r002-${size}.png`,png,size,size);
    await saveAsset(`assets/jersey-generic-painted-${surface}-r002-${size}.webp`,webp,size,size);
    previews[`${surface}-${size}`]=png;
  }
}
const text=(x,y,size,value,fill='#A8B3C4')=>`<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" fill="${fill}">${value}</text>`;
let board=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="910"><rect width="1200" height="910" fill="#061224"/>${text(48,50,14,'NETBET SPORT / PAINTED GENERIC JERSEY / r002')}${text(48,101,34,'Original fabric. Purposeful paint.','#F6F7FA')}${text(48,135,15,'Graphite shoulders · angular silver panels · tonal sides · original round collar')}`;
board+='<rect x="48" y="168" width="540" height="580" rx="18" fill="#0B1A2B"/><rect x="612" y="168" width="540" height="580" rx="18" fill="#FFFFFF"/>';
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
board+=text(48,792,16,'Paint is editable vector geometry, multiplied with the original 8K fabric RGB and alpha.')+text(48,826,14,'Transparent PNG / lossless WebP + 8000 × 5000 PNG masters. No logos, team colours or lettering.')+text(48,861,14,'New r002 artwork; r001 preserved. UX Lead review pending. No Figma or fallback implementation.')+'</svg>';
await sharp(Buffer.from(board)).composite(layers).png().toFile(`${out}/review-board.png`);
manifest.checks={sourceHash:'pass',nativeAlpha:'identical',master8KAlpha:'identical',pngWebpVisiblePixels:'identical',validatedVectorLayers:9,assetCount:manifest.assets.length};
await fs.writeFile(`${out}/manifest.json`,JSON.stringify(manifest,null,2)+'\n');
await fs.writeFile(`${out}/ASSET-SPEC.txt`, `NETBET SPORT — PAINTED GENERIC JERSEY r002\n13 October 2026 | UX Lead approval pending\n\nOriginal base.png (8000 x 5000) is the fabric and silhouette source.\nNine validated vector layers add graphite shoulders, angular silver chest\nfacets, tapered side panels and fine tonal edge paint. Physical collar and\nsource alpha are preserved; fabric is neither traced nor replaced.\nNo team identity, sponsor, number or lettering.\n\nFILES\n52 square transparent PNG/lossless WebP exports: ${sizes.join(', ')} px.\nTwo 8000 x 5000 PNG masters preserve the original full canvas and alpha.\nThe square exports use the established tight crop for small UI slots.\nUse on-dark on dark components; on-light on light components.\nUse 2x source size for the CSS slot (24 -> 48, 48 -> 96, 64 -> 128).\n24 CSS px is the proposed minimum. Keep aspect ratio and full opacity.\n\nEDITABLE PAINT\neditable-paint contains JSON configs and paint-only SVGs in 200-unit space.\nThese SVGs are source layers, not standalone jersey icons; final fabric\ncomposites are PNG/WebP. Rebuild: node scripts/build-painted-generic-jersey.mjs\nImplementation: src/lib/generic-jersey-painted.js and src/lib/png-shirt.js.\n\nUSAGE\nUse only for an unmapped club jersey. Retain mapped team jerseys and national\nflags. Fallback logic is a separate Development task. Use empty alt text\nwhen adjacent text already names the team; otherwise supply the team name.\n\nREVIEW\nreview-board.png shows both variants and 24–80 px specimens.\nUser identified the existing project styling as NetBet Sport context.\nValidate in actual component slots and obtain UX Lead approval before release.\nPNG/WebP is proposed to retain original fabric; format agreement is pending.\nNo Figma. r001 remains unchanged.\n`);
const files={};
async function collect(dir,prefix='') { for(const entry of await fs.readdir(dir,{withFileTypes:true})) { const relative=prefix+entry.name; if(entry.isDirectory()) await collect(`${dir}/${entry.name}`,relative+'/'); else files[relative]=new Uint8Array(await fs.readFile(`${dir}/${entry.name}`)); } }
await collect(out);
await fs.writeFile('artifacts/generic-jersey/netbet-generic-jersey-painted-r002.zip',zipSync(files,{level:6}));
console.log(JSON.stringify({out,checks:manifest.checks},null,2));
