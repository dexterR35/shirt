/**
 * Prototype step 1: a Blender-ready copy of the app's prepared 3D shirt.
 * Same mesh and mapping as the 3D view (public/assets/3d), but without meshopt
 * compression or quantization, which Blender's importer does not read, and with the
 * front/back and side-panel weights moved into COLOR_0 (R = facing, 0 back … 1 front;
 * G = side panel), because Blender imports vertex colors but not custom attributes.
 * TEXCOORD_0 = kit paint UV (200-unit grid), TEXCOORD_1 = fabric detail UV.
 */
import fs from 'node:fs/promises';
import { NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';

const manifest = JSON.parse(await fs.readFile('public/assets/3d/manifest.json', 'utf8'));
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read('public' + manifest.path);
await doc.transform(dequantize());
for (const extension of doc.getRoot().listExtensionsUsed()) extension.dispose();

const [prim] = doc.getRoot().listMeshes()[0].listPrimitives();
const facing = prim.getAttribute('_FACING'), side = prim.getAttribute('_SIDE'), n = facing.getCount();
const color = new Float32Array(n * 4);
for (let i = 0; i < n; i++) color.set([facing.getScalar(i) * 0.5 + 0.5, side.getScalar(i), 0, 1], i * 4);
prim.setAttribute('COLOR_0', doc.createAccessor('facing-side').setType('VEC4').setArray(color).setBuffer(doc.getRoot().listBuffers()[0]));
prim.setAttribute('_FACING', null);
prim.setAttribute('_SIDE', null);
facing.dispose();
side.dispose();

await fs.writeFile('prototypes/blender-passes/out/shirt-for-blender.glb', await io.writeBinary(doc));
console.log(`shirt-for-blender.glb: ${prim.getIndices().getCount() / 3} triangles, from ${manifest.path}`);
