/**
 * The 3D shirt: three.js scene, fabric material and lighting shared by the Studio's
 * 3D view and 3D downloads. Loaded only when the 3D view is switched on.
 *
 * Paint is the kit's own validated SVG (renderColorArtwork), drawn twice: the front
 * (with the sewn neckline) and the back (with the collar's back ring). Both use the
 * same registered 200-unit projection; the smoothed surface direction (_facing, +1 front,
 * -1 back) picks which one a point shows. Where the torso turns sideways (_side), the
 * fabric shows one column of the design, like a jersey's side panel, instead of a
 * grazing projection. The mesh's source texture adds its stitching and fabric folds,
 * the way the 2D composite multiplies paint into the PNG.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { renderColorArtwork } from './png-shirt.js';
import { neutralConfig } from './shirt-renderer.js';
import { LIGHTING_MAX, validateLighting } from './composite.js';
import { MODEL_3D_MANIFEST, validateModelManifest } from './shirt-3d-model.js';
import { CAMERA_FOV, poseToPosition, validatePose } from './shirt-3d-pose.js';
import { encodePixels } from './png-preview.js';
import { EXPORT_FORMATS, EXPORT_SIZES, exportDimensions } from './export.js';

/** Paint texture sizes: the screen, and downloads of 2048 px and more. */
const PAINT_SIZE = 2048, PAINT_SIZE_LARGE = 4096;
/** How strongly the source texture's stitching and folds show (0 = flat paint). */
const DETAIL_STRENGTH = 0.55;

let model = null;
/**
 * The prepared mesh and its fabric detail texture, fetched once and verified against
 * the manifest before use. A failed load is retried next time.
 * @returns {Promise<{manifest:object, geometry:THREE.BufferGeometry, matrix:THREE.Matrix4, detail:THREE.Texture}>}
 */
export function loadShirtModel() {
  model ??= (async () => {
    const response = await fetch(MODEL_3D_MANIFEST);
    if (!response.ok) throw Error(`The 3D shirt could not be loaded (${response.status}).`);
    const manifest = validateModelManifest(await response.json());
    const file = await fetch(manifest.path);
    if (!file.ok) throw Error(`The 3D shirt could not be loaded (${file.status}).`);
    const bytes = await file.arrayBuffer();
    // crypto.subtle exists only in secure contexts (https, localhost); the size always checks.
    const digest = crypto.subtle && [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map((b) => b.toString(16).padStart(2, '0')).join('');
    if (bytes.byteLength !== manifest.bytes || (digest && digest !== manifest.sha256))
      throw Error('The 3D shirt file does not match its manifest. Reload the page.');
    const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes, '');
    let mesh = null;
    gltf.scene.traverse((o) => { if (o.isMesh) mesh = o; });
    const detail = mesh?.material.map;
    const attributes = mesh?.geometry.attributes ?? {};
    if (!attributes.uv || !attributes.uv1 || !attributes._facing || !attributes._side || !detail) throw Error('The 3D shirt file is incomplete.');
    // Fabric detail is data (a shading multiplier), not a color; read it unconverted.
    detail.colorSpace = THREE.NoColorSpace;
    detail.channel = 1;
    detail.needsUpdate = true;
    mesh.material.dispose();
    // Quantized positions stay compact on the GPU; the node's transform restores meters.
    mesh.updateWorldMatrix(true, false);
    return { manifest, geometry: mesh.geometry, matrix: mesh.matrixWorld.clone(), detail };
  })().catch((error) => {
    model = null;
    throw error.message?.startsWith('The 3D shirt') ? error : Error('The 3D shirt could not be loaded. Retry.');
  });
  return model;
}

/** Rasterize kit paint (validated SVG) for one side of the shirt. */
async function paintCanvas(config, side, size) {
  const url = URL.createObjectURL(new Blob([renderColorArtwork(config, { side })], { type: 'image/svg+xml' }));
  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    await image.decode().catch(() => { throw Error('The kit colors could not be drawn. Retry the preview.'); });
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    // CPU-backed: the side-panel pick reads it back, and texture upload reads it anyway.
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(image, 0, 0, size, size);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Where side panels may take their column: just inside the torso panel's edges (paint units). */
const SIDE_RANGE = Object.freeze({ left: [53, 66], right: [134, 147], rows: [95, 190] });

/**
 * The design column each torso side panel shows (texture u, left and right): the
 * column near the torso edge that best matches the most common color there. Hoops keep
 * wrapping around; vertical stripes give a panel in the kit's main edge color.
 * @param {HTMLCanvasElement} canvas Front paint.
 * @returns {[number, number]}
 */
export function sideColumns(canvas) {
  const k = canvas.width / 200, ctx = canvas.getContext('2d', { willReadFrequently: true });
  const [top, bottom] = SIDE_RANGE.rows.map((v) => Math.round(v * k));
  // Ties go to the column nearest the torso edge.
  const pick = ([from, to], edge) => {
    const x0 = Math.floor(from * k), { data, width } = ctx.getImageData(x0, top, Math.ceil(to * k) - x0 + 1, bottom - top + 1);
    const columns = [];
    for (let u = from; u <= to; u += 0.5) {
      const x = Math.round(u * k) - x0, keys = [];
      for (let y = 0; y <= bottom - top; y += Math.max(1, Math.round(k))) {
        const i = (y * width + x) * 4;
        keys.push(((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4));
      }
      columns.push({ u, keys });
    }
    const counts = new Map();
    for (const { keys } of columns) for (const key of keys) counts.set(key, (counts.get(key) || 0) + 1);
    const main = [...counts].reduce((best, entry) => (entry[1] > best[1] ? entry : best))[0];
    const score = ({ u, keys }) => keys.filter((key) => key === main).length - Math.abs(u - edge) * 1e-6;
    return columns.reduce((best, column) => (score(column) > score(best) ? column : best)).u / 200;
  };
  return [pick(SIDE_RANGE.left, SIDE_RANGE.left[0]), pick(SIDE_RANGE.right, SIDE_RANGE.right[1])];
}

/**
 * Knit fabric: the paint is the base color; the source texture multiplies in its
 * stitching and folds (normalized to average 1, in linear light, like the 2D multiply)
 * and also occludes ambient light. Sheen gives the soft grazing highlight of polyester.
 */
function fabricMaterial(front, back, detail, detailMean) {
  const material = new THREE.MeshPhysicalMaterial({
    map: front,
    roughness: 0.78,
    metalness: 0,
    sheen: 0.6,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color(0.32, 0.32, 0.32),
    aoMap: detail,
    aoMapIntensity: 0.6,
  });
  const uniforms = {
    backMap: { value: back },
    sideColumn: { value: new THREE.Vector2(0.3, 0.7) },
    detailMean: { value: detailMean },
    detailStrength: { value: DETAIL_STRENGTH },
  };
  material.userData.shirt = uniforms;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float _facing;\nattribute float _side;\nvarying float vShirtFront;\nvarying float vSidePanel;')
      .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nvShirtFront = _facing;\nvSidePanel = _side;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D backMap;\nuniform vec2 sideColumn;\nuniform float detailMean;\nuniform float detailStrength;\nvarying float vShirtFront;\nvarying float vSidePanel;')
      .replace('#include <map_fragment>', /* glsl */ `
        // Print and side panel crossfade as colors: blending coordinates would sweep across stripes.
        float front = smoothstep( -0.18, 0.18, vShirtFront );
        vec2 panelUv = vec2( vMapUv.x < 0.5 ? sideColumn.x : sideColumn.y, vMapUv.y );
        vec4 printed = mix( texture2D( backMap, vMapUv ), texture2D( map, vMapUv ), front );
        vec4 panel = mix( texture2D( backMap, panelUv ), texture2D( map, panelUv ), front );
        diffuseColor *= mix( printed, panel, vSidePanel );
        float fabric = pow( clamp( texture2D( aoMap, vAoMapUv ).r / detailMean, 0.0, 1.3 ), 2.2 );
        diffuseColor.rgb *= mix( 1.0, fabric, detailStrength );`);
  };
  material.customProgramCacheKey = () => 'shirt-fabric-3';
  return material;
}

function paintTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * A lit shirt on a transparent canvas. The light rig moves with the camera, like a
 * photographer's studio: every angle gets the same key, fill and rim light.
 */
export class ShirtScene {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{shadowSize?:number}} [options]
   */
  constructor(canvas, { shadowSize = 2048 } = {}) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // PBR Neutral keeps team colors true (made for product renders); exposure is the Lighting slider.
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer = renderer;
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    this.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.scene.environment = this.environment;
    this.scene.environmentIntensity = 0.5;
    this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.05, 20);
    this.scene.add(this.camera);
    const target = new THREE.Object3D();
    this.scene.add(target);
    const light = (intensity, [x, y, z]) => {
      const l = new THREE.DirectionalLight(0xffffff, intensity);
      l.position.set(x, y, z);
      l.target = target;
      this.camera.add(l);
      return l;
    };
    // Camera-relative positions (meters): key upper left, fill right, rim behind the shirt.
    const key = light(2.3, [-1.1, 1.25, 0.2]);
    light(0.55, [1.5, 0.2, 0]);
    light(1.3, [0.7, 1.1, -3.6]);
    key.castShadow = true;
    Object.assign(key.shadow.camera, { left: -0.55, right: 0.55, top: 0.55, bottom: -0.55, near: 0.2, far: 6 });
    key.shadow.mapSize.set(shadowSize, shadowSize);
    key.shadow.radius = 4;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.0035;
    key.shadow.camera.updateProjectionMatrix();
    // Replaced by the first setPaint(); nothing renders before that.
    this.front = paintTexture(document.createElement('canvas'));
    this.back = paintTexture(document.createElement('canvas'));
    this.front.anisotropy = this.back.anisotropy = renderer.capabilities.getMaxAnisotropy();
    this.mesh = null;
    this.paintKey = null;
  }

  /** @param {{geometry:THREE.BufferGeometry, matrix:THREE.Matrix4, detail:THREE.Texture, manifest:object}} shirt */
  setModel(shirt) {
    if (this.mesh) return;
    this.material = fabricMaterial(this.front, this.back, shirt.detail, shirt.manifest.detail.mean);
    if (this.sideColumn) this.material.userData.shirt.sideColumn.value.set(...this.sideColumn);
    this.mesh = new THREE.Mesh(shirt.geometry, this.material);
    this.mesh.applyMatrix4(shirt.matrix);
    this.mesh.castShadow = this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);
  }

  /**
   * Paint both sides from a kit configuration (null: the plain white shirt).
   * Returns false if a newer paint request replaced this one.
   */
  async setPaint(config, size = PAINT_SIZE) {
    const paint = config ?? neutralConfig();
    const key = size + ':' + JSON.stringify(paint);
    if (key === this.paintKey) return true;
    this.paintKey = key;
    const [front, back] = await Promise.all([paintCanvas(paint, 'front', size), paintCanvas(paint, 'back', size)]);
    if (this.paintKey !== key) return false;
    this.sideColumn = sideColumns(front);
    this.material?.userData.shirt.sideColumn.value.set(...this.sideColumn);
    // Swap in fully drawn canvases, so a half-painted texture is never uploaded.
    for (const [texture, canvas] of [[this.front, front], [this.back, back]]) {
      if (texture.image.width !== size) {
        texture.dispose();
        texture.image = canvas;
      } else texture.image.getContext('2d').drawImage(canvas, 0, 0);
      texture.needsUpdate = true;
    }
    return true;
  }

  /** The app's -100…100 lighting as exposure: 0 is neutral, ±100 is one stop. */
  setLighting(lighting) {
    this.renderer.toneMappingExposure = Math.pow(2, validateLighting(lighting) / LIGHTING_MAX);
  }

  /** @param {import('./shirt-3d-pose.js').ShirtPose} pose */
  setPose(pose) {
    this.camera.position.set(...poseToPosition(validatePose(pose)));
    this.camera.lookAt(0, 0, 0);
  }

  /** Square drawing buffer of `size` CSS pixels at `pixelRatio`. */
  setSize(size, pixelRatio = 1) {
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(size, size, false);
    this.camera.aspect = 1;
    this.camera.updateProjectionMatrix();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Free this scene's GPU resources; the shared mesh and detail texture stay loaded.
   * `loseContext` also releases the WebGL context (only once its canvas is gone:
   * a canvas whose context was lost can never draw again).
   */
  dispose({ loseContext = true } = {}) {
    this.front.dispose();
    this.back.dispose();
    this.environment.dispose();
    this.material?.dispose();
    this.renderer.dispose();
    if (loseContext) this.renderer.forceContextLoss();
  }
}

// Downloads render in their own hidden scene, so the Studio's view never flickers.
let exporter = null;
/**
 * The 3D shirt at `pose` as a square ImageData of `size` pixels, transparent around it.
 * Up to 2048 px renders at twice the size and scales down (super-sampling).
 */
export async function renderShirt3dPixels(config, size, lighting, pose) {
  const shirt = await loadShirtModel();
  exporter ??= new ShirtScene(document.createElement('canvas'), { shadowSize: 4096 });
  exporter.setModel(shirt);
  const limit = exporter.renderer.capabilities.maxTextureSize;
  const sample = size * 2 <= Math.min(limit, 4096) ? 2 : 1;
  exporter.setSize(size * sample, 1);
  await exporter.setPaint(config, size >= 2048 ? PAINT_SIZE_LARGE : PAINT_SIZE);
  exporter.setLighting(lighting);
  exporter.setPose(pose);
  exporter.render();
  // Read the frame in the same task it was drawn (no preserveDrawingBuffer needed).
  const out = document.createElement('canvas');
  out.width = out.height = size;
  const ctx = out.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(exporter.canvas, 0, 0, size, size);
  return ctx.getImageData(0, 0, size, size);
}

/**
 * A 3D download: the square render centered on a transparent canvas of the chosen
 * shape, encoded like every other download (same sizes, shapes and formats).
 * @returns {Promise<Blob>}
 */
export async function renderShirt3dImage(config, size, format = 'png', ratio = '1:1', lighting = 0, pose) {
  if (!EXPORT_SIZES.includes(size)) throw Error('Choose one of the offered download sizes.');
  const spec = EXPORT_FORMATS[format];
  if (!spec) throw Error('Choose PNG, WebP, SVG or AVIF.');
  const { width, height } = exportDimensions(size, ratio);
  const pixels = await renderShirt3dPixels(config, Math.min(width, height), lighting, pose);
  return encodePixels(pixels, { type: spec.type, label: spec.label, width, height });
}
