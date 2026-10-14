// Compare a Blender base candidate with base.png before any swap is considered.
// Reports alpha bounds and silhouette overlap, and writes review overlays.
// Neither base.png nor any deployed asset is modified.
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const BASE = 'base.png';
const CANDIDATE = process.argv[2] ?? 'artifacts/blender-shirt/base-candidate-r007.png';
const OUT = 'artifacts/blender-shirt';
const THRESHOLD = 128;

async function alpha(file) {
  const { data, info } = await sharp(file).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

function bounds({ data, width, height }) {
  let x0 = width, x1 = -1, y0 = height, y1 = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[y * width + x] >= THRESHOLD) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  return { x0, x1, y0, y1 };
}

const base = await alpha(BASE);
const candidate = await alpha(CANDIDATE);
if (base.width !== candidate.width || base.height !== candidate.height) {
  throw new Error(`Canvas mismatch: base ${base.width}x${base.height}, candidate ${candidate.width}x${candidate.height}`);
}
const { width, height } = base;
let both = 0, either = 0, onlyBase = 0, onlyCandidate = 0;
// Red: only in base.png. Cyan: only in the candidate. Grey: shared.
const overlay = Buffer.alloc(width * height * 4);
for (let i = 0; i < width * height; i++) {
  const a = base.data[i] >= THRESHOLD;
  const b = candidate.data[i] >= THRESHOLD;
  if (a || b) either++;
  if (a && b) both++;
  else if (a) onlyBase++;
  else if (b) onlyCandidate++;
  const o = i * 4;
  if (a && b) overlay.set([150, 150, 150, 255], o);
  else if (a) overlay.set([230, 40, 40, 255], o);
  else if (b) overlay.set([30, 200, 220, 255], o);
}
const report = {
  base: BASE,
  candidate: CANDIDATE,
  alphaThreshold: THRESHOLD,
  baseBounds: bounds(base),
  candidateBounds: bounds(candidate),
  iou: both / either,
  onlyBasePixels: onlyBase,
  onlyCandidatePixels: onlyCandidate,
};
await sharp(overlay, { raw: { width, height, channels: 4 } }).resize(2000).png().toFile(`${OUT}/base-candidate-silhouette-diff.png`);
// Side-by-side review at reduced size: base.png left, candidate right, on the app's dark surface.
const half = { width: 2000, height: 1250 };
const shrink = (file) => sharp(file).resize(half.width).flatten({ background: '#1b2433' }).png().toBuffer();
await sharp({ create: { width: half.width * 2, height: half.height, channels: 3, background: '#1b2433' } })
  .composite([{ input: await shrink(BASE), left: 0, top: 0 }, { input: await shrink(CANDIDATE), left: half.width, top: 0 }])
  .png().toFile(`${OUT}/base-candidate-side-by-side.png`);
await writeFile(`${OUT}/base-candidate-report.json`, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
