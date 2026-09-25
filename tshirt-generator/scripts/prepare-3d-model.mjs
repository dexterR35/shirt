/**
 * Prepare the 3D shirt for the browser (npm run model:prepare).
 *
 * Source: data/model.glb, an image-to-3D mesh of base.png (765,903 triangles, 24 MB),
 * kept unchanged. Output: public/assets/3d/shirt-<hash>.glb plus manifest.json.
 *   1. Bake the node scale and turn the shirt to face +Z (it faces +X in the source).
 *   2. Register the front silhouette to base.png's alpha in the 200-unit paint grid
 *      (affine fit, reported as IoU) and store paint UVs as TEXCOORD_0. The source's
 *      own UVs move to TEXCOORD_1 for its baked fabric/stitch detail texture.
 *      Torso fabric that turns sideways is marked as side panel (_SIDE), where the
 *      runtime shows one column of the design instead of grazing projection. Front/back
 *      facing (_FACING) comes from a Taubin-smoothed surface.
 *   3. Simplify, reorder, quantize and meshopt-compress; the detail texture is 2048 JPEG.
 */
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { weld, simplify, reorder, quantize, meshopt, prune, dedup } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { PNG_BASE } from '../src/lib/png-shirt.js';
import { NEW_BASE_GEOMETRY } from '../src/lib/new-base-geometry.js';
import { MODEL_3D_VERSION, paintPoint, validateModelManifest } from '../src/lib/shirt-3d-model.js';

const SOURCE = 'data/model.glb', SOURCE_SHA256 = '67864b189cf2d8095733d9bc8e4250bf344ab8d9f9708737984750ad99b7f2df';
const OUT = 'public/assets/3d', SIMPLIFY_RATIO = 0.3, SIMPLIFY_ERROR = 0.0004, DETAIL_SIZE = 2048, SMOOTH_ROUNDS = 80;
/** Torso side panels: |smoothed normal x| from SIDE_FROM (front/back print) to SIDE_TO (side panel). */
const SIDE_FROM = 0.55, SIDE_TO = 0.85, SIDE_SMOOTH_ROUNDS = 40;
const sha = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

/** Absolute M/L/H/V/Q/C/Z path (the measured panel geometry) as a closed polyline. */
function flattenPath(d) {
  const tokens = d.match(/[MLHVQCZ]|[-+]?(?:\d*\.\d+|\d+)/g), points = [];
  let i = 0, command = 'M', at = [0, 0], first = at;
  const number = () => Number(tokens[i++]);
  const curve = (controls, end) => {
    const all = [at, ...controls, end];
    for (let step = 1; step <= 24; step++) {
      const t = step / 24;
      let row = all;
      while (row.length > 1) row = row.slice(1).map((p, k) => [row[k][0] + t * (p[0] - row[k][0]), row[k][1] + t * (p[1] - row[k][1])]);
      points.push(row[0]);
    }
    at = end;
  };
  while (i < tokens.length) {
    if (/[A-Z]/.test(tokens[i])) command = tokens[i++];
    if (command === 'M') { at = first = [number(), number()]; points.push(at); command = 'L'; }
    else if (command === 'L') points.push(at = [number(), number()]);
    else if (command === 'H') points.push(at = [number(), at[1]]);
    else if (command === 'V') points.push(at = [at[0], number()]);
    else if (command === 'Q') curve([[number(), number()]], [number(), number()]);
    else if (command === 'C') curve([[number(), number()], [number(), number()]], [number(), number()]);
    else if (command === 'Z') points.push(at = first);
  }
  return points;
}
/** Leftmost and rightmost crossing of a horizontal line (the panel's width at that row). */
function rowExtent(points, y) {
  let left = Infinity, right = -Infinity;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++)
    if ((points[i][1] > y) !== (points[j][1] > y)) {
      const x = points[j][0] + ((y - points[j][1]) * (points[i][0] - points[j][0])) / (points[i][1] - points[j][1]);
      left = Math.min(left, x); right = Math.max(right, x);
    }
  return [left, right];
}
function insidePolygon(points, x, y) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++)
    if ((points[i][1] > y) !== (points[j][1] > y) && x < points[j][0] + ((y - points[j][1]) * (points[i][0] - points[j][0])) / (points[i][1] - points[j][1])) inside = !inside;
  return inside;
}

const input = await fs.readFile(SOURCE);
const sourceHash = sha(input);
if (process.argv.includes('--accept-source')) console.log(`Source ${SOURCE}: ${sourceHash}`);
else if (sourceHash !== SOURCE_SHA256) throw Error(`${SOURCE} changed (${sourceHash}). Inspect it, re-register the paint, then update SOURCE_SHA256.`);

await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization])
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
const doc = await io.readBinary(input);
const root = doc.getRoot(), [node] = root.listNodes(), [prim] = root.listMeshes()[0].listPrimitives();
const sourceTriangles = prim.getIndices().getCount() / 3;

// 1. Bake the uniform node scale; rotate +X (front) to +Z. (x, y, z) -> (-z, y, x) keeps handedness.
const scale = node.getScale()[0];
if (node.getScale().some((s) => Math.abs(s - scale) > 1e-6) || node.getRotation().some((q, i) => q !== [0, 0, 0, 1][i]))
  throw Error('Unexpected source node transform');
const turn = (accessor, factor) => {
  const a = accessor.getArray();
  for (let i = 0; i < a.length; i += 3) [a[i], a[i + 1], a[i + 2]] = [-a[i + 2] * factor, a[i + 1] * factor, a[i] * factor];
  accessor.setArray(a);
};
turn(prim.getAttribute('POSITION'), scale);
turn(prim.getAttribute('NORMAL'), 1);
node.setMatrix([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

// 2. Register the front silhouette (orthographic along -Z) to base.png alpha.
const P = prim.getAttribute('POSITION').getArray(), I = prim.getIndices().getArray(), n = P.length / 3;
let [xmin, xmax, ymin, ymax] = [Infinity, -Infinity, Infinity, -Infinity];
for (let i = 0; i < n; i++) {
  xmin = Math.min(xmin, P[3 * i]); xmax = Math.max(xmax, P[3 * i]);
  ymin = Math.min(ymin, P[3 * i + 1]); ymax = Math.max(ymax, P[3 * i + 1]);
}
const M = 2400, mask = new Uint8Array(M * M), mx = (M - 1) / (xmax - xmin), my = (M - 1) / (ymax - ymin);
function fill(ax, ay, bx, by, cx, cy) {
  const d = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  if (Math.abs(d) < 1e-12) return;
  for (let y = Math.max(0, Math.floor(Math.min(ay, by, cy))); y <= Math.min(M - 1, Math.ceil(Math.max(ay, by, cy))); y++)
    for (let x = Math.max(0, Math.floor(Math.min(ax, bx, cx))); x <= Math.min(M - 1, Math.ceil(Math.max(ax, bx, cx))); x++) {
      const px = x + 0.5, py = y + 0.5, w0 = ((bx - px) * (cy - py) - (by - py) * (cx - px)) / d, w1 = ((cx - px) * (ay - py) - (cy - py) * (ax - px)) / d;
      if (w0 >= -1e-6 && w1 >= -1e-6 && 1 - w0 - w1 >= -1e-6) mask[y * M + x] = 1;
    }
}
const at = (i) => [(P[3 * i] - xmin) * mx, (ymax - P[3 * i + 1]) * my];
for (let t = 0; t < I.length; t += 3) fill(...at(I[t]), ...at(I[t + 1]), ...at(I[t + 2]));

// The PNG's 200-unit square at 4 pixels per unit (alpha >= 128 is garment).
const G = 800, crop = Math.round(200 * PNG_BASE.scale);
const alpha = await sharp('base.png').extract({ left: Math.round(PNG_BASE.x), top: Math.round(PNG_BASE.y), width: crop, height: crop })
  .extractChannel(3).resize(G, G, { kernel: 'lanczos3' }).raw().toBuffer();
const offset = [(PNG_BASE.x - Math.round(PNG_BASE.x)) / PNG_BASE.scale, (PNG_BASE.y - Math.round(PNG_BASE.y)) / PNG_BASE.scale];
const cropUnits = crop / PNG_BASE.scale;
/** Model x = a*u + b, y = c*v + d. */
function iou([a, b, c, d]) {
  let inter = 0, union = 0;
  for (let py = 0; py < G; py++) {
    const iy = Math.round((ymax - (c * ((py + 0.5) / G * cropUnits - offset[1]) + d)) * my);
    for (let px = 0; px < G; px++) {
      const ix = Math.round((a * ((px + 0.5) / G * cropUnits - offset[0]) + b - xmin) * mx);
      const m = ix >= 0 && iy >= 0 && ix < M && iy < M && mask[iy * M + ix], s = alpha[py * G + px] >= 128;
      if (m && s) inter++;
      if (m || s) union++;
    }
  }
  return inter / union;
}
// Start from the PNG's measured garment bounds (x 14..186, y 2..198), then coordinate descent.
let fit = [(xmax - xmin) / 172, xmin - 14 * (xmax - xmin) / 172, -(ymax - ymin) / 196, ymax + 2 * (ymax - ymin) / 196];
let best = iou(fit), steps = fit.map((v) => Math.abs(v) * 0.01);
for (let round = 0; round < 60 && steps.some((s, i) => s > Math.abs(fit[i]) * 1e-5); round++) {
  let improved = false;
  for (let j = 0; j < 4; j++) for (const sign of [1, -1]) {
    const next = fit.slice();
    next[j] += sign * steps[j];
    const score = iou(next);
    if (score > best) [best, fit, improved] = [score, next, true];
  }
  if (!improved) steps = steps.map((s) => s / 2);
}
const [a, b, c, d] = fit;
const paint = { coordinateSpace: 'reference-200', x0: b, y0: d, xScale: 1 / a, yScale: -1 / c, iou: +best.toFixed(4) };
console.log(`Paint registration IoU ${(best * 100).toFixed(2)}% (${(a / -c).toFixed(4)} x/y scale ratio)`);

// A wrinkle-free copy of the surface (Taubin smoothing keeps the overall shape): its
// normals say which way the fabric faces without flickering across every fold.
const weldOf = new Uint32Array(n), firstOf = [], keys = new Map();
for (let i = 0; i < n; i++) {
  const key = `${P[3 * i].toFixed(6)},${P[3 * i + 1].toFixed(6)},${P[3 * i + 2].toFixed(6)}`;
  if (!keys.has(key)) { keys.set(key, firstOf.length); firstOf.push(i); }
  weldOf[i] = keys.get(key);
}
const w = firstOf.length, degree = new Uint32Array(w + 1);
for (let t = 0; t < I.length; t += 3) for (let e = 0; e < 3; e++) degree[weldOf[I[t + e]]] += 2;
const start = new Uint32Array(w + 1);
for (let v = 0; v < w; v++) start[v + 1] = start[v] + degree[v];
const neighbors = new Uint32Array(start[w]), cursor = start.slice(0, w);
for (let t = 0; t < I.length; t += 3) for (let e = 0; e < 3; e++) {
  const a = weldOf[I[t + e]], b = weldOf[I[t + (e + 1) % 3]];
  neighbors[cursor[a]++] = b;
  neighbors[cursor[b]++] = a;
}
let smooth = new Float64Array(w * 3);
firstOf.forEach((i, v) => smooth.set([P[3 * i], P[3 * i + 1], P[3 * i + 2]], 3 * v));
for (let round = 0; round < SMOOTH_ROUNDS; round++) for (const factor of [0.5, -0.53]) {
  const next = new Float64Array(w * 3);
  for (let v = 0; v < w; v++) {
    const count = start[v + 1] - start[v];
    for (let q = 0; q < 3; q++) {
      let sum = 0;
      for (let k = start[v]; k < start[v + 1]; k++) sum += smooth[3 * neighbors[k] + q];
      next[3 * v + q] = smooth[3 * v + q] + factor * (sum / count - smooth[3 * v + q]);
    }
  }
  smooth = next;
}
const smoothNormal = new Float64Array(w * 3);
for (let t = 0; t < I.length; t += 3) {
  const [a, b, c] = [weldOf[I[t]], weldOf[I[t + 1]], weldOf[I[t + 2]]];
  const e1 = [0, 1, 2].map((q) => smooth[3 * b + q] - smooth[3 * a + q]), e2 = [0, 1, 2].map((q) => smooth[3 * c + q] - smooth[3 * a + q]);
  const cross = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
  for (const v of [a, b, c]) for (let q = 0; q < 3; q++) smoothNormal[3 * v + q] += cross[q];
}
const smoothstep = (lo, hi, x) => { const t = Math.min(1, Math.max(0, (x - lo) / (hi - lo))); return t * t * (3 - 2 * t); };
for (let v = 0; v < w; v++) {
  const length = Math.hypot(smoothNormal[3 * v], smoothNormal[3 * v + 1], smoothNormal[3 * v + 2]) || 1;
  for (let q = 0; q < 3; q++) smoothNormal[3 * v + q] /= length;
}

// Where the torso's fabric turns sideways, a straight front-to-back projection draws
// contour lines of x across the folds: stripes wobble, split and merge. Like the side
// panels of a real jersey, that fabric instead shows one column of the design (chosen
// per kit at runtime, see shirt-3d.js), so hoops still wrap around and vertical stripes
// become a clean panel. _SIDE is how much of a point is side panel (0 front/back print,
// 1 panel), smoothed over the fabric so the change is gradual. Collar, shoulders and
// sleeves always keep the exact projection.
const torsoOutline = flattenPath(NEW_BASE_GEOMETRY.torso);
const planar = new Float64Array(w * 2);
let sidePanel = new Float64Array(w);
const inTorso = new Uint8Array(w);
for (let v = 0; v < w; v++) {
  const i = firstOf[v], [u, pv] = paintPoint(P[3 * i], P[3 * i + 1], paint);
  planar.set([u, pv], 2 * v);
  if (pv < 40 || !insidePolygon(torsoOutline, u, pv)) continue;
  inTorso[v] = 1;
  // Only near the torso's edges: a fold turning sideways mid-chest stays printed.
  const [left, right] = rowExtent(torsoOutline, pv), edge = Math.min(u - left, right - u);
  sidePanel[v] = smoothstep(SIDE_FROM, SIDE_TO, Math.abs(smoothNormal[3 * v])) * smoothstep(45, 60, pv) * (1 - smoothstep(12, 20, edge));
}
for (let round = 0; round < SIDE_SMOOTH_ROUNDS; round++) {
  const next = new Float64Array(w);
  for (let v = 0; v < w; v++) {
    if (!inTorso[v]) continue;
    let sum = 0;
    for (let k = start[v]; k < start[v + 1]; k++) sum += sidePanel[neighbors[k]];
    next[v] = sum / (start[v + 1] - start[v]);
  }
  sidePanel = next;
}
// Paint UVs are TEXCOORD_0; the source atlas UVs (fabric/stitch detail) become TEXCOORD_1.
// _FACING is the smoothed normal's z: +1 front, -1 back; it picks front or back paint.
const detailUv = prim.getAttribute('TEXCOORD_0');
const paintUvs = new Float32Array(n * 2), facing = new Float32Array(n), side = new Float32Array(n);
for (let i = 0; i < n; i++) {
  const v = weldOf[i];
  paintUvs.set([planar[2 * v] / 200, 1 - planar[2 * v + 1] / 200], 2 * i);
  facing[i] = smoothNormal[3 * v + 2];
  side[i] = sidePanel[v];
}
const buffer = root.listBuffers()[0];
prim.setAttribute('TEXCOORD_1', detailUv);
prim.setAttribute('TEXCOORD_0', doc.createAccessor('paint-uv').setType('VEC2').setArray(paintUvs).setBuffer(buffer));
prim.setAttribute('_FACING', doc.createAccessor('facing').setType('SCALAR').setArray(facing).setBuffer(buffer));
prim.setAttribute('_SIDE', doc.createAccessor('side-panel').setType('SCALAR').setArray(side).setBuffer(buffer));

// Average fabric brightness as seen on the surface (area-weighted), so detail averages 1.
const [texture] = root.listTextures();
const { data: detailPixels, info } = await sharp(texture.getImage()).greyscale().raw().toBuffer({ resolveWithObject: true });
const DU = detailUv.getArray();
let weighted = 0, area = 0;
for (let t = 0; t < I.length; t += 3) {
  const [i, j, k] = [I[t], I[t + 1], I[t + 2]];
  const e1 = [0, 1, 2].map((q) => P[3 * j + q] - P[3 * i + q]), e2 = [0, 1, 2].map((q) => P[3 * k + q] - P[3 * i + q]);
  const cross = Math.hypot(e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]) / 2;
  const u = (DU[2 * i] + DU[2 * j] + DU[2 * k]) / 3, v = (DU[2 * i + 1] + DU[2 * j + 1] + DU[2 * k + 1]) / 3;
  const x = Math.min(info.width - 1, Math.floor(u * info.width)), y = Math.min(info.height - 1, Math.floor(v * info.height));
  weighted += (detailPixels[y * info.width + x] / 255) * cross;
  area += cross;
}
texture.setImage(await sharp(texture.getImage()).resize(DETAIL_SIZE, DETAIL_SIZE, { kernel: 'lanczos3' }).jpeg({ quality: 90, mozjpeg: true }).toBuffer())
  .setMimeType('image/jpeg').setName('fabric-detail').setURI('');
const material = prim.getMaterial().setName('shirt-fabric').setRoughnessFactor(0.85).setMetallicFactor(0);
material.getBaseColorTextureInfo().setTexCoord(1);

// 3. Simplify and compress.
await doc.transform(
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: SIMPLIFY_RATIO, error: SIMPLIFY_ERROR }),
  // keepAttributes: prune would otherwise drop the paint UVs (no glTF material samples them).
  dedup(), prune({ keepAttributes: true }),
  reorder({ encoder: MeshoptEncoder }),
  quantize({ quantizePosition: 16, quantizeNormal: 12, quantizeTexcoord: 14 }),
  meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
);
root.getAsset().generator = `tshirt-generator model:prepare (${MODEL_3D_VERSION}) from ${root.getAsset().generator}`;
const glb = await io.writeBinary(doc);
const hash = sha(glb);
const out = root.listMeshes()[0].listPrimitives()[0];
const bounds = { min: [xmin, ymin, Infinity], max: [xmax, ymax, -Infinity] };
for (let i = 2; i < P.length; i += 3) [bounds.min[2], bounds.max[2]] = [Math.min(bounds.min[2], P[i]), Math.max(bounds.max[2], P[i])];
const manifest = validateModelManifest({
  version: MODEL_3D_VERSION,
  path: `/assets/3d/shirt-${hash.slice(0, 12)}.glb`,
  sha256: hash,
  bytes: glb.byteLength,
  triangles: out.getIndices().getCount() / 3,
  vertices: out.getAttribute('POSITION').getCount(),
  orientation: 'front +Z, up +Y, meters',
  bounds: { min: bounds.min.map((v) => +v.toFixed(5)), max: bounds.max.map((v) => +v.toFixed(5)) },
  paint,
  detail: { size: DETAIL_SIZE, mean: +(weighted / area).toFixed(4), texCoord: 1 },
  source: { path: SOURCE, sha256: sourceHash, generator: 'https://tripo3d.ai', triangles: sourceTriangles, pngBase: PNG_BASE.sha256 },
  method: 'Unchanged image-to-3D source; turned to face +Z, simplified and meshopt-compressed. Kit paint is the same validated SVG, projected front-to-back through an affine fit of the mesh silhouette to base.png alpha. The source texture is kept only as fabric/stitch detail.',
});
await fs.mkdir(OUT, { recursive: true });
for (const file of await fs.readdir(OUT)) if (/^shirt-[\da-f]{12}\.glb$/.test(file)) await fs.rm(`${OUT}/${file}`);
await fs.writeFile(`public${manifest.path}`, glb);
await fs.writeFile(`${OUT}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
console.log(`${manifest.path}: ${manifest.triangles} triangles (source ${sourceTriangles}), ${(glb.byteLength / 1e6).toFixed(2)} MB`);
