import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { MODEL_3D_MANIFEST, paintPoint, validateModelManifest } from '../src/lib/shirt-3d-model.js';
import {
  CAMERA_FOV, DEFAULT_POSE, POSE_LIMITS, POSE_PRESETS, describePose, nearestAzimuth,
  poseToPosition, positionToPose, presetPose, threeDFilename, validatePose,
} from '../src/lib/shirt-3d-pose.js';
import { renderColorArtwork } from '../src/lib/png-shirt.js';
import { BACK_NECK_RING } from '../src/lib/png-collar.js';
import { neutralConfig } from '../src/lib/shirt-renderer.js';
import { sideColumns } from '../src/lib/shirt-3d.js';

const sha = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const manifest = validateModelManifest(JSON.parse(await fs.readFile('public' + MODEL_3D_MANIFEST, 'utf8')));

test('the 3D mesh is the prepared copy of the unchanged source model', async () => {
  const glb = await fs.readFile('public' + manifest.path);
  assert.equal(glb.byteLength, manifest.bytes);
  assert.equal(sha(glb), manifest.sha256);
  assert.equal(manifest.path, `/assets/3d/shirt-${manifest.sha256.slice(0, 12)}.glb`);
  assert.equal(sha(await fs.readFile(manifest.source.path)), manifest.source.sha256, 'data/model.glb must stay byte-identical');
  assert.equal(manifest.source.pngBase, '4670b8b8dd8d66d22a4b5313aac9e5406d9c0913244a72bdcebe41e347637042');
  // Only the current content-named mesh is deployed.
  assert.deepEqual((await fs.readdir('public/assets/3d')).filter((f) => f.endsWith('.glb')), [manifest.path.split('/').pop()]);
  assert.ok(manifest.paint.iou >= 0.98, `registration IoU ${manifest.paint.iou}`);
});

test('the manifest is validated before anything is fetched', () => {
  assert.throws(() => validateModelManifest({ ...manifest, path: 'https://example.com/shirt.glb' }));
  assert.throws(() => validateModelManifest({ ...manifest, paint: { ...manifest.paint, iou: 0.5 } }));
  assert.throws(() => validateModelManifest({ ...manifest, detail: { mean: 2 } }));
  assert.throws(() => validateModelManifest(null));
});

test('the mesh carries paint UVs, fabric detail UVs, facing and side-panel weights', async () => {
  await MeshoptDecoder.ready;
  const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
  const doc = await io.read('public' + manifest.path);
  const [prim] = doc.getRoot().listMeshes()[0].listPrimitives();
  assert.equal(prim.getIndices().getCount() / 3, manifest.triangles);
  for (const name of ['POSITION', 'NORMAL', 'TEXCOORD_0', 'TEXCOORD_1', '_FACING', '_SIDE']) assert.ok(prim.getAttribute(name), name);
  const read = (name) => {
    const accessor = prim.getAttribute(name), out = [], element = [];
    for (let i = 0; i < accessor.getCount(); i++) out.push([...accessor.getElement(i, element)]);
    return out;
  };
  const uv = read('TEXCOORD_0'), side = read('_SIDE').map(([v]) => v), facing = read('_FACING').map(([v]) => v);
  assert.ok(uv.every(([u, v]) => u >= 0 && u <= 1 && v >= 0 && v <= 1), 'paint UVs stay inside the 200-unit grid');
  assert.ok(side.every((v) => v >= 0 && v <= 1));
  assert.ok(side.some((v) => v > 0.9), 'the torso has side panels');
  assert.ok(facing.some((v) => v > 0.9) && facing.some((v) => v < -0.9), 'front and back fabric are both marked');
  // Side panels stay near the torso edges (paint u), never across the chest.
  assert.ok(uv.every(([u], i) => side[i] < 0.05 || Math.abs(u * 200 - 100) > 25));
  assert.equal(doc.getRoot().listMaterials()[0].getBaseColorTextureInfo().getTexCoord(), 1);
});

test('the registered projection maps the mesh onto the PNG garment in the 200-unit grid', () => {
  const [left, top] = paintPoint(manifest.bounds.min[0], manifest.bounds.max[1], manifest.paint);
  const [right, bottom] = paintPoint(manifest.bounds.max[0], manifest.bounds.min[1], manifest.paint);
  // base.png's garment spans x 14..186 and y 2..198 (docs/BASE_ANALYSIS.md).
  for (const [value, expected] of [[left, 14], [right, 186], [bottom, 198]]) assert.ok(Math.abs(value - expected) < 2.5, `${value} vs ${expected}`);
  // The back collar rises above the front neckline, so the mesh top reaches the grid top.
  assert.ok(top > -1 && top < 3, `top ${top}`);
});

test('back paint swaps only the neckline for the measured back ring; front output is unchanged', () => {
  const config = neutralConfig('#224466');
  config.colors.collar = '#EE1111';
  assert.equal(renderColorArtwork(config), renderColorArtwork(config, { side: 'front' }));
  const back = renderColorArtwork(config, { side: 'back' });
  assert.ok(back.includes(`<path d="${BACK_NECK_RING}" fill="#EE1111"/>`));
  assert.doesNotMatch(back, /clip-path="url\(#base-neck\)"/);
  assert.throws(() => renderColorArtwork(config, { side: 'left' }));
});

test('back paint renders for saved kits without markup injection', async () => {
  const files = (await fs.readdir('data/kits')).filter((f) => f.endsWith('.json')).slice(0, 60);
  for (const file of files) {
    const { config } = JSON.parse(await fs.readFile('data/kits/' + file, 'utf8'));
    const svg = renderColorArtwork(config, { side: 'back' });
    assert.doesNotMatch(svg, /<image|<filter|data:image|<script|href=/);
    await sharp(Buffer.from(svg)).png().toBuffer();
  }
});

test('camera poses are validated, wrapped and clamped', () => {
  assert.deepEqual(validatePose({ version: 1, azimuth: 540, elevation: 200, distance: 99 }),
    { version: 1, azimuth: 180, elevation: POSE_LIMITS.elevation[1], distance: POSE_LIMITS.distance[1] });
  assert.equal(validatePose({ version: 1, azimuth: -190, elevation: 0, distance: 2 }).azimuth, 170);
  for (const bad of [null, {}, { version: 2, azimuth: 0, elevation: 0, distance: 2 }, { version: 1, azimuth: NaN, elevation: 0, distance: 2 }, '{"version":1}'])
    assert.throws(() => validatePose(bad));
  for (const pose of [DEFAULT_POSE, ...POSE_PRESETS.map((p) => presetPose(p.id))]) {
    const back = positionToPose(poseToPosition(pose));
    assert.ok(Math.abs(back.azimuth - pose.azimuth) < 0.02 && Math.abs(back.elevation - pose.elevation) < 0.02 && Math.abs(back.distance - pose.distance) < 0.02);
  }
  assert.throws(() => presetPose('top'));
  assert.equal(presetPose('back', { ...DEFAULT_POSE, distance: 2.5 }).distance, 2.5, 'switching angle never zooms');
  assert.equal(nearestAzimuth(170, -170), 190, 'tweens take the short way round');
  assert.equal(describePose({ version: 1, azimuth: -35, elevation: 8, distance: 1.72 }), '35° left · 8° up · 1.72 m');
  assert.equal(threeDFilename('england-arsenal-home-r001-512px.png'), 'england-arsenal-home-r001-512px-3d.png');
});

test('the default pose frames the shirt like the flat preview (7/8 of the height)', () => {
  const visible = 2 * DEFAULT_POSE.distance * Math.tan((CAMERA_FOV / 2) * Math.PI / 180);
  const height = manifest.bounds.max[1] - manifest.bounds.min[1];
  assert.ok(Math.abs(height / visible - 7 / 8) < 0.02, `${height / visible}`);
});

test('side panels take the column that best matches the main color near the torso edge', () => {
  // A 400 px paint: white body with thin black pinstripes every 6 units.
  const k = 2, pixel = (u) => (Math.floor(u) % 6 === 0 ? 0 : 255);
  const canvas = {
    width: 400,
    getContext: () => ({
      getImageData(x0, y0, width, height) {
        const data = new Uint8ClampedArray(width * height * 4);
        for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
          const value = pixel((x0 + x) / k);
          data.set([value, value, value, 255], (y * width + x) * 4);
        }
        return { data, width };
      },
    }),
  };
  const [left, right] = sideColumns(canvas);
  assert.equal(pixel(left * 200), 255, 'left panel is white, not a pinstripe');
  assert.equal(pixel(right * 200), 255, 'right panel is white, not a pinstripe');
  assert.ok(left * 200 >= 53 && left * 200 <= 66 && right * 200 >= 134 && right * 200 <= 147);
});
