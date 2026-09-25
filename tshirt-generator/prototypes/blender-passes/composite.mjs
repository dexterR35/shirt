/**
 * Prototype step 3: build one kit from Blender's passes, entirely in 2D, the way the
 * app composites base.png today: paint (the same validated kit SVG) looked up through
 * the UV pass, multiplied by the shading pass, alpha from the shading pass.
 *
 * node prototypes/blender-passes/composite.mjs "<team>" <home|away> <views dir> <out dir> <view>...
 */
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { kitPreviewConfig } from '../../src/lib/png-layout.js';
import { renderColorArtwork } from '../../src/lib/png-shirt.js';
import { sideColumns } from '../../src/lib/shirt-3d.js';

const [team, variant, viewsDir, outDir, ...views] = process.argv.slice(2);
const catalog = JSON.parse(await fs.readFile('public/catalog/manifest.json', 'utf8'));
const entry = catalog.teams.find((t) => t.name === team);
const item = { ...entry.kits[variant], team_id: entry.id, variant };
const config = kitPreviewConfig(JSON.parse(await fs.readFile('public' + item.details_path, 'utf8')), item);

const PAINT = 2048;
const raster = async (side) => sharp(Buffer.from(renderColorArtwork(config, { side })), { density: (72 * PAINT) / 200 })
  .resize(PAINT, PAINT).ensureAlpha().raw().toBuffer();
const [front, back] = await Promise.all([raster('front'), raster('back')]);
// The same side-panel column choice as the 3D view, on a canvas-like wrapper.
const [leftColumn, rightColumn] = sideColumns({
  width: PAINT,
  getContext: () => ({
    getImageData(x0, y0, width, height) {
      const data = new Uint8ClampedArray(width * height * 4);
      for (let y = 0; y < height; y++) data.set(front.subarray(((y0 + y) * PAINT + x0) * 4, ((y0 + y) * PAINT + x0 + width) * 4), y * width * 4);
      return { data, width };
    },
  }),
});

/** Bilinear paint lookup at texture (u, v), v from the top; returns sRGB 0..1. */
function sample(paint, u, v, out, weight) {
  const x = Math.min(PAINT - 1.001, Math.max(0, u * PAINT - 0.5)), y = Math.min(PAINT - 1.001, Math.max(0, v * PAINT - 0.5));
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
  for (let c = 0; c < 3; c++) {
    const at = (xx, yy) => paint[(yy * PAINT + xx) * 4 + c];
    const top = at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx, bottom = at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx;
    out[c] += ((top * (1 - fy) + bottom * fy) / 255) * weight;
  }
}
const smoothstep = (lo, hi, x) => { const t = Math.min(1, Math.max(0, (x - lo) / (hi - lo))); return t * t * (3 - 2 * t); };

async function readFloat(path, size) {
  const bytes = await fs.readFile(path), data = new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4);
  // Blender stores the bottom row first.
  const flipped = new Float32Array(data.length);
  for (let y = 0; y < size; y++) flipped.set(data.subarray((size - 1 - y) * size * 4, (size - y) * size * 4), y * size * 4);
  return flipped;
}

for (const view of views) {
  const shadingImage = sharp(`${viewsDir}/${view}-shading.png`);
  const { width: size } = await shadingImage.metadata();
  const shading = await shadingImage.raw().toBuffer();
  const uv = await readFloat(`${viewsDir}/${view}-uv.f32`, size), attr = await readFloat(`${viewsDir}/${view}-attr.f32`, size);
  const covered = (p) => uv[p * 4 + 3] > 0.5;
  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const p = y * size + x, alpha = shading[p * 4 + 3] / 255;
    if (alpha === 0) continue;
    // Anti-aliased silhouette pixels take the data of the nearest covered pixel.
    let q = p;
    for (let r = 1; !covered(q) && r <= 3; r++)
      for (let dy = -r; dy <= r && !covered(q); dy++) for (let dx = -r; dx <= r && !covered(q); dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx >= 0 && yy >= 0 && xx < size && yy < size && covered(yy * size + xx)) q = yy * size + xx;
      }
    if (!covered(q)) continue;
    const u = uv[q * 4], v = uv[q * 4 + 1], frontWeight = smoothstep(-0.18, 0.18, attr[q * 4] * 2 - 1), side = attr[q * 4 + 1];
    // 2 × 2 supersampling from the UV gradient (the data pass itself has no anti-aliasing).
    const qx = q % size, qy = Math.floor(q / size);
    const grad = (dx, dy, c) => {
      const a = (qy + dy) * size + qx + dx, b = (qy - dy) * size + qx - dx;
      return covered(a) && covered(b) && Math.abs(uv[a * 4 + c] - uv[b * 4 + c]) < 0.05 ? (uv[a * 4 + c] - uv[b * 4 + c]) / 2 : 0;
    };
    const dudx = grad(1, 0, 0), dvdx = grad(1, 0, 1), dudy = grad(0, 1, 0), dvdy = grad(0, 1, 1);
    const color = [0, 0, 0];
    for (const [ox, oy] of [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]]) {
      const su = u + ox * dudx + oy * dudy, sv = v + ox * dvdx + oy * dvdy, panelU = su < 0.5 ? leftColumn : rightColumn;
      for (const [paint, w] of [[front, frontWeight], [back, 1 - frontWeight]]) {
        if (w === 0) continue;
        sample(paint, su, sv, color, 0.25 * w * (1 - side));
        if (side > 0) sample(paint, panelU, sv, color, 0.25 * w * side);
      }
    }
    // Multiply into the shading exactly like the 2D compositor multiplies into base.png.
    for (let c = 0; c < 3; c++) out[p * 4 + c] = Math.round(color[c] * shading[p * 4 + c]);
    out[p * 4 + 3] = Math.round(alpha * 255);
  }
  const file = `${outDir}/${team.toLowerCase().replace(/\W+/g, '-')}-${variant}-${view}-blender.png`;
  await sharp(out, { raw: { width: size, height: size, channels: 4 } }).png().toFile(file);
  console.log(file);
}
