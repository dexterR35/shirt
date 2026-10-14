import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { PNG_BASE, PNG_PREVIEW, renderColorArtwork, compositePixels } from '../src/lib/png-shirt.js';
import { genericJerseyConfig, GENERIC_SURFACES } from '../src/lib/generic-jersey-r001.js';

// Separate review deliverable: never enters the researched kit catalog.
const out = 'artifacts/generic-jersey/r001';
await fs.mkdir(`${out}/assets`, { recursive: true });
const sourceFile = await fs.readFile('base.png');
assert.equal(crypto.createHash('sha256').update(sourceFile).digest('hex'), PNG_BASE.sha256);
const { left, top, side } = PNG_PREVIEW.crop;
const raw = await sharp(sourceFile).extract({ left, top, width: side, height: side }).ensureAlpha().raw().toBuffer();
const variants = GENERIC_SURFACES;
const sizes = [24, 32, 40, 48, 64, 80, 96, 128, 160, 168, 256, 336, 512];
const manifest = { revision: 'r001', status: 'proposal-awaiting-UX-review', issue: 'GIMODEAR-15531', source: { file: 'base.png', sha256: PNG_BASE.sha256, renderer: PNG_BASE.version, crop: PNG_PREVIEW.crop }, formatDecision: 'PNG/WebP preserve the authorized fabric source; no traced SVG or raster disguised as SVG.', variants, assets: [], checks: {} };
const previews = {};
for (const name of Object.keys(variants)) {
  const config = genericJerseyConfig(name);
  const svg = renderColorArtwork(config);
  const paintSvg = svg.replace('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">', `<svg xmlns="http://www.w3.org/2000/svg" width="${side}" height="${side}" viewBox="${left} ${top} ${side} ${side}"><g transform="translate(${PNG_BASE.x} ${PNG_BASE.y}) scale(${PNG_BASE.scale})">`).replace('</svg>', '</g></svg>');
  const paint = await sharp(Buffer.from(paintSvg)).ensureAlpha().raw().toBuffer();
  const composite = compositePixels(raw, paint);
  for (let i = 3; i < raw.length; i += 4) assert.equal(composite[i], raw[i], 'Original alpha must remain unchanged');
  await fs.writeFile(`${out}/${name}.config.json`, `${JSON.stringify(config, null, 2)}\n`);
  for (const size of sizes) {
    const resized = await sharp(composite, { raw: { width: side, height: side, channels: 4 } }).resize(size, size).png().toBuffer();
    for (const format of ['png', 'webp']) {
      const bytes = format === 'png' ? await sharp(resized).png({ compressionLevel: 9 }).toBuffer() : await sharp(resized).webp({ lossless: true, effort: 6 }).toBuffer();
      const file = `assets/jersey-generic-${name}-r001-${size}.${format}`;
      await fs.writeFile(`${out}/${file}`, bytes);
      const decoded = await sharp(bytes).ensureAlpha().raw().toBuffer();
      const expected = await sharp(resized).ensureAlpha().raw().toBuffer();
      // Lossless WebP may discard invisible RGB beneath fully transparent pixels.
      for (let i = 0; i < decoded.length; i += 4) {
        assert.equal(decoded[i + 3], expected[i + 3], `${file}: alpha at ${i / 4}`);
        if (expected[i + 3]) for (let c = 0; c < 3; c++) assert.equal(decoded[i + c], expected[i + c], `${file}: visible RGB at ${i / 4}`);
      }
      manifest.assets.push({ file, width: size, height: size, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
    }
    previews[`${name}-${size}`] = resized;
  }
}
manifest.checks = { sourceHash: 'pass', nativeAlphaIdentical: 'pass', exportVisibleRGBAndAlphaIdentical: 'pass', assetCount: manifest.assets.length, uxApproval: 'pending', designContext: 'user-confirmed-project-shirt-styling-2026-10-13' };
await fs.writeFile(`${out}/manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`);

// Static review proof, using the project's documented surfaces. It is not an
// assertion that these are the new NetBet Sport design system tokens.
const width = 1200, height = 1050;
const t = (x, y, s, text, color = '#F6F7FA', weight = 400) => `<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${s}" font-weight="${weight}" fill="${color}">${text}</text>`;
const rect = (x,y,w,h,fill,r=16) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
let board = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${rect(0,0,width,height,'#061224',0)}`;
board += t(48,48,13,'NETBET SPORT  /  GIMODEAR-15531','#A8B3C4',700) + t(48,101,38,'A familiar shape. A neutral identity.','#F6F7FA',700) + t(48,133,15,'Generic jersey proposal · r001 · UX approval pending','#A8B3C4');
board += rect(48,165,540,345,'#0B1A2B') + rect(612,165,540,345,'#FFFFFF');
board += t(72,201,14,'01  ON DARK','#A8B3C4',700) + t(636,201,14,'02  ON LIGHT','#56687A',700);
board += t(72,487,14,'Silver grey · original fabric and physical round collar','#A8B3C4') + t(636,487,14,'Graphite grey · same silhouette and placement','#56687A');
board += t(48,553,21,'Small-size checks','#F6F7FA',700) + t(48,579,13,'Actual 1× display sizes. 24 px is the proposed minimum; confirm against live components.','#A8B3C4');
board += rect(48,601,540,136,'#102238') + rect(612,601,540,136,'#FFFFFF');
const layers=[];
for (const [index,name] of ['on-dark','on-light'].entries()) {
  layers.push({input:previews[`${name}-256`],left:190+index*564,top:213});
  for (const [i,size] of [24,32,40,48,64,80].entries()) {
    const x=76+index*564+i*82;
    layers.push({input:previews[`${name}-${size}`],left:x+Math.round((80-size)/2),top:616+80-size});
    board += t(x+25,719,12,`${size} px`,index?'#56687A':'#A8B3C4');
  }
}
board += t(48,787,21,'Usage direction','#F6F7FA',700);
board += t(48,824,16,'Mapped club jersey → retain existing asset.','#A8B3C4') + t(48,854,16,'Unmapped club → generic jersey for the component background.','#A8B3C4') + t(48,884,16,'Mapped national flag → retain the country flag.','#A8B3C4');
board += t(48,956,14,'Transparent PNG + lossless WebP · no badge, sponsor, flag, lettering or team pattern.','#A8B3C4');
board += t(48,987,14,'NetBet Sport project styling · navy and white surface checks · UX Lead approval pending.','#A8B3C4');
board += '</svg>';
await sharp(Buffer.from(board)).composite(layers).png().toFile(`${out}/review-board.png`);

let contexts=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="890">${rect(0,0,1200,890,'#061224',0)}`;
contexts+=t(48,52,13,'NETBET SPORT / GENERIC JERSEY / ILLUSTRATIVE COMPONENTS','#A8B3C4',700)+t(48,105,34,'One fallback across the Sports experience.','#F6F7FA',700)+t(48,140,14,'Provisional layouts and sizes. These are not copied from the new NetBet design system.','#A8B3C4');
const contextLayers=[];
for(const [index,name] of ['on-dark','on-light'].entries()) {
  const x=48+index*564, light=index===1, ink=light?'#14212F':'#F6F7FA', muted=light?'#56687A':'#A8B3C4';
  contexts+=rect(x,175,540,598,light?'#FFFFFF':'#0B1A2B')+t(x+24,211,15,light?'LIGHT SURFACE':'DARK SURFACE',ink,700);
  contexts+=t(x+24,263,18,'Homepage fixture card',ink,700)+t(x+24,290,13,'Football · Today, 19:45',muted);
  contextLayers.push({input:previews[`${name}-48`],left:x+30,top:313},{input:previews[`${name}-48`],left:x+456,top:313});
  contexts+=t(x+95,344,18,'Club A',ink,700)+t(x+251,344,14,'vs',muted)+t(x+364,344,18,'Club B',ink,700)+t(x+24,395,12,'48 px display / use 96 px export at 2×',muted);
  contexts+=t(x+24,454,18,'Competition listing',ink,700)+t(x+24,494,13,'19:45',muted)+t(x+133,494,15,'Club A',ink)+t(x+263,494,14,'—',muted)+t(x+344,494,15,'Club B',ink);
  contextLayers.push({input:previews[`${name}-24`],left:x+94,top:474},{input:previews[`${name}-24`],left:x+305,top:474});
  contexts+=t(x+24,530,12,'24 px display / use 48 px export at 2×',muted);
  contexts+=t(x+24,591,18,'Event detail header',ink,700)+t(x+135,642,23,'Club A — Club B',ink,700)+t(x+135,670,13,'Today · Kick-off 19:45',muted);
  contextLayers.push({input:previews[`${name}-64`],left:x+26,top:614},{input:previews[`${name}-64`],left:x+448,top:614});
  contexts+=t(x+24,730,12,'64 px display / use 128 px export at 2×',muted);
}
contexts+=t(48,818,14,'Both example clubs are unmapped. Existing mapped jerseys and country flags remain in place.','#A8B3C4')+t(48,850,14,'Status: design proposal. Raster-format agreement and UX Lead approval pending.','#A8B3C4')+'</svg>';
await sharp(Buffer.from(contexts)).composite(contextLayers).png().toFile(`${out}/component-previews.png`);
console.log(JSON.stringify({output:out, assets:manifest.assets.length, checks:manifest.checks, sampleBytes:manifest.assets.filter(a=>[64,168].includes(a.width))}, null, 2));
