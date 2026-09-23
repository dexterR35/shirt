import { PNG_BASE, PNG_PREVIEW, renderColorArtwork, compositePixels } from './png-shirt.js';
import { partIdConfig, matchPartId, countPartPixels, namedPartsOnly, visibleParts } from './kit-edit.js';

const images = new Map();
const surfaces = new Map();
// Finished kits stay in memory until reload, so revisiting one does not repaint it.
const renders = new Map(), RENDER_LIMIT = 8;
/** Load and decode off the main thread, so a large image never freezes the page. */
async function loadImage(url) {
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  try { await image.decode(); }
  catch { throw Error('The high-resolution PNG base could not be loaded. Retry the preview.'); }
  return image;
}
function canvas(size) {
  const result=document.createElement('canvas');
  result.width=result.height=size;
  return result;
}
/** Screen sizes use the 2048 copy; only larger renders load the full master. */
function baseSource(size) {
  return size <= PNG_PREVIEW.size
    ? {path: PNG_PREVIEW.path, width: PNG_PREVIEW.size, height: PNG_PREVIEW.size, x: PNG_PREVIEW.x, y: PNG_PREVIEW.y, span: PNG_PREVIEW.span}
    : {path: PNG_BASE.path, width: PNG_BASE.width, height: PNG_BASE.height, x: PNG_BASE.x, y: PNG_BASE.y, span: PNG_BASE.scale*200};
}
async function basePixels(size) {
  if(surfaces.has(size))return surfaces.get(size);
  const src=baseSource(size);
  if(!images.has(src.path))images.set(src.path, loadImage(src.path).catch(error=>{images.delete(src.path);throw error;}));
  const image=await images.get(src.path);
  if(image.naturalWidth!==src.width || image.naturalHeight!==src.height)throw Error('The PNG base dimensions do not match the saved master.');
  const target=canvas(size),ctx=target.getContext('2d',{willReadFrequently:true});
  const margin=size/16,span=size*7/8;
  ctx.imageSmoothingQuality='high';
  ctx.drawImage(image,src.x,src.y,src.span,src.span,margin,margin,span,span);
  const pixels=ctx.getImageData(0,0,size,size);
  // Cache a small number of display resolutions, never copies per team.
  if(surfaces.size>=2)surfaces.delete(surfaces.keys().next().value);
  surfaces.set(size,pixels);
  return pixels;
}

/** Compose from the original PNG on demand. Display size never alters the source. */
export async function renderPngPreview(config,size=1024,{cache=true}={}) {
  if(!Number.isInteger(size)||size<256||size>4096)throw Error('Invalid preview size');
  const source=await basePixels(size);
  if(!config)return source;
  const key=size+':'+JSON.stringify(config);
  if(cache&&renders.has(key)){
    const hit=renders.get(key);
    renders.delete(key);renders.set(key,hit);
    return hit;
  }
  const url=URL.createObjectURL(new Blob([renderColorArtwork(config)],{type:'image/svg+xml'}));
  try {
    const image=await loadImage(url),target=canvas(size),ctx=target.getContext('2d',{willReadFrequently:true});
    ctx.fillStyle='#FFFFFF';ctx.fillRect(0,0,size,size);
    const margin=size/16,span=size*7/8;
    ctx.drawImage(image,margin,margin,span,span);
    const result=new ImageData(compositePixels(source.data,ctx.getImageData(0,0,size,size).data),size,size);
    if(cache){
      if(renders.size>=RENDER_LIMIT)renders.delete(renders.keys().next().value);
      renders.set(key,result);
    }
    return result;
  } finally {URL.revokeObjectURL(url);}
}

const PART_MAP_SIZE = 400;
let partMap = null;
async function idPixels(idConfig) {
  const url = URL.createObjectURL(new Blob([renderColorArtwork(idConfig)], {type: 'image/svg+xml'}));
  try {
    const image = await loadImage(url), target = canvas(PART_MAP_SIZE), ctx = target.getContext('2d', {willReadFrequently: true});
    ctx.drawImage(image, 0, 0, PART_MAP_SIZE, PART_MAP_SIZE);
    return ctx.getImageData(0, 0, PART_MAP_SIZE, PART_MAP_SIZE).data;
  } finally { URL.revokeObjectURL(url); }
}
/** Hidden flat render where every editable part has its own ID color. */
async function partMapFor(config) {
  const key = JSON.stringify(config);
  if (partMap?.key !== key) {
    const {config: idConfig, ids} = partIdConfig(config);
    const pixels = await idPixels(idConfig), idAt = new Array(PART_MAP_SIZE * PART_MAP_SIZE);
    for (let p = 0; p < idAt.length; p++) idAt[p] = matchPartId(ids, [pixels[p * 4], pixels[p * 4 + 1], pixels[p * 4 + 2]]);
    partMap = {key, ids, idConfig, pixels, idAt};
  }
  return partMap;
}
/** Which editable part is painted at a point in 200-unit coordinates, or null. */
export async function partAt(config, u, v) {
  const map = await partMapFor(config);
  const k = PART_MAP_SIZE / 200, x = Math.floor(u * k), y = Math.floor(v * k);
  if (x < 0 || y < 0 || x >= PART_MAP_SIZE || y >= PART_MAP_SIZE) return null;
  return map.idAt[y * PART_MAP_SIZE + x];
}

/** The app's --accent color as RGB, so the shirt outline matches the rest of the UI. */
function accentRgb() {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  return /^#[\da-f]{6}$/i.test(value) ? [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16)) : [145, 216, 210];
}
/**
 * Draw the selected part (teal tint + outline) and the hovered part (light outline)
 * into `overlay`, matching `shirt`'s size and trimmed to the shirt's own transparency.
 */
export async function drawPartHighlight(overlay, shirt, config, selectedId, hoverId) {
  const map = await partMapFor(config), S = PART_MAP_SIZE;
  // The shirt's own transparency at map resolution, so outlines also follow the silhouette.
  const margin = shirt.width / 16, span = (shirt.width * 7) / 8;
  const alphaCanvas = canvas(S), actx = alphaCanvas.getContext('2d', {willReadFrequently: true});
  actx.drawImage(shirt, margin, margin, span, span, 0, 0, S, S);
  const alpha = actx.getImageData(0, 0, S, S).data;
  const idAt = map.idAt.map((id, p) => (alpha[p * 4 + 3] < 128 ? null : id));
  const accent = accentRgb();
  const layer = canvas(S), lctx = layer.getContext('2d'), img = lctx.createImageData(S, S), out = img.data;
  const same = (p, dx, dy, id) => {
    const x = (p % S) + dx, y = Math.floor(p / S) + dy;
    return x >= 0 && y >= 0 && x < S && y < S && idAt[y * S + x] === id;
  };
  for (let p = 0; p < idAt.length; p++) {
    const id = idAt[p];
    if (!id || (id !== selectedId && id !== hoverId)) continue;
    // A 2-pixel band along every border of the part.
    let edge = false;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [0, 2], [0, -2]])
      if (!same(p, dx, dy, id)) { edge = true; break; }
    const [r, g, b, a] = id === selectedId ? [...accent, edge ? 255 : 28] : [255, 255, 255, edge ? 200 : 0];
    if (a) out.set([r, g, b, a], p * 4);
  }
  lctx.putImageData(img, 0, 0);
  overlay.width = shirt.width;
  overlay.height = shirt.height;
  const ctx = overlay.getContext('2d');
  ctx.clearRect(0, 0, overlay.width, overlay.height);
  ctx.drawImage(layer, margin, margin, span, span);
  // Keep the highlight only where the shirt itself is opaque.
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(shirt, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
}
/** Parts worth offering in the editor (see visibleParts in kit-edit.js). */
export async function visiblePartIds(config) {
  const map = await partMapFor(config);
  return visibleParts(countPartPixels(map.ids, map.pixels), countPartPixels(map.ids, await idPixels(namedPartsOnly(map.idConfig))));
}
