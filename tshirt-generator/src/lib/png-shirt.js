import { validateConfig } from './shirt-renderer.js';
import { NEW_BASE_GEOMETRY } from './new-base-geometry.js';
import { PNG_NECK_AREA, baseCollarPaint } from './png-collar.js';

const SHA256 = '4670b8b8dd8d66d22a4b5313aac9e5406d9c0913244a72bdcebe41e347637042';
// 3779 source pixels cover y=2..198. Center x is 4000 source pixels.
const SCALE = 3779 / 196, X = 4000 - 100 * SCALE, Y = 611 - 2 * SCALE;

/** Source pixels are retained; this mapping only places editable 200-unit paint. */
export const PNG_BASE = Object.freeze({
  version: 'original-png-composite-1',
  // Content-named so a replaced master never reuses a cached URL.
  path: `/assets/base/source-${SHA256.slice(0, 12)}.png`,
  width: 8000,
  height: 5000,
  sha256: SHA256,
  scale: SCALE,
  x: X,
  y: Y,
});

// Whole-pixel master region that contains the 200-unit square (and the whole shirt).
const CROP_LEFT = Math.floor(X), CROP_TOP = Math.floor(Y),
  CROP_SIDE = Math.max(Math.ceil(X + 200 * SCALE) - CROP_LEFT, Math.ceil(Y + 200 * SCALE) - CROP_TOP),
  PREVIEW_SIZE = 2048, F = PREVIEW_SIZE / CROP_SIDE;

/**
 * Screen copy built from the master at build time: the square crop, resized to 2048.
 * Display sizes never exceed 2048, so it looks identical while loading far less.
 * x/y/span locate the 200-unit square inside the preview, in preview pixels.
 */
export const PNG_PREVIEW = Object.freeze({
  path: `/assets/base/preview-${PREVIEW_SIZE}-${SHA256.slice(0, 12)}-v1.webp`,
  size: PREVIEW_SIZE,
  crop: Object.freeze({ left: CROP_LEFT, top: CROP_TOP, side: CROP_SIDE }),
  x: (X - CROP_LEFT) * F,
  y: (Y - CROP_TOP) * F,
  span: 200 * SCALE * F,
});

/** SVG contains paint only. Exact garment edges and fabric come from the PNG. */
export function renderColorArtwork(config) {
  const c = validateConfig(config), g = NEW_BASE_GEOMETRY, defs = [];
  const shape = (p, id) => {
    let fill = p.colorRole ? c.colors[p.colorRole] : p.fill;
    if (typeof fill === 'object') {
      defs.push(`<linearGradient id="paint-${id}" gradientUnits="userSpaceOnUse" x1="${fill.x1}" y1="${fill.y1}" x2="${fill.x2}" y2="${fill.y2}">${fill.stops.map(s=>`<stop offset="${s.offset}" stop-color="${s.color}"/>`).join('')}</linearGradient>`);
      fill = `url(#paint-${id})`;
    }
    const attrs = `fill="${fill}" opacity="${p.opacity ?? 1}"`;
    const element = p.type === 'rect'
      ? `<rect x="${p.x}" y="${p.y}" width="${p.width}" height="${p.height}" rx="${p.rx ?? 0}" ${attrs}/>`
      : p.type === 'polygon'
        ? `<polygon points="${p.points.map(v=>v.join(',')).join(' ')}" ${attrs}/>`
        : `<path d="${p.d}" ${attrs}/>`;
    return p.clip === 'all' ? element : `<g clip-path="url(#${p.clip})">${element}</g>`;
  };
  const artwork = c.layers.map((p,i)=>shape(p,`layer-${i}`)).join('');
  const details = (c.detailLayers || []).map((p,i)=>shape(p,`detail-${i}`)).join('');
  // Neck paint cannot extend onto the chest as a second V/polo collar.
  const collarLayers = c.templateVersion === 'png-front-1' && c.collar.shape === 'custom'
    ? c.collar.layers : baseCollarPaint(c).layers;
  const collar = `<g clip-path="url(#base-neck)">${collarLayers.map((p,i)=>shape(p,`collar-${i}`)).join('')}</g>`;
  const bodyClip=`M0 0H200V200H0Z${g.leftSleeve}${g.rightSleeve}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs>${[['body',bodyClip],['leftSleeve',g.leftSleeve],['rightSleeve',g.rightSleeve],['base-neck',PNG_NECK_AREA]].map(([id,d])=>`<clipPath id="${id}"><path d="${d}" clip-rule="evenodd"/></clipPath>`).join('')}${defs.join('')}</defs><rect width="200" height="200" fill="${c.colors.body}"/><path d="${g.leftSleeve}" fill="${c.colors.leftSleeve}"/><path d="${g.rightSleeve}" fill="${c.colors.rightSleeve}"/>${artwork}<path d="${g.leftCuff}" fill="${c.colors.leftCuff}"/><path d="${g.rightCuff}" fill="${c.colors.rightCuff}"/>${details}${collar}</svg>`;
}

/** Multiply only RGB, preserving every original alpha value (including edges).
 * White paint reproduces the source exactly. Inputs are unpremultiplied RGBA.
 * @param {Uint8Array|Uint8ClampedArray} source
 * @param {Uint8Array|Uint8ClampedArray} paint
 * @returns {Uint8ClampedArray}
 */
export function compositePixels(source, paint) {
  if(source.length !== paint.length || source.length % 4) throw Error('RGBA buffers must match');
  const result = new Uint8ClampedArray(source.length);
  for(let i=0;i<source.length;i+=4){
    result[i]=Math.round(source[i]*paint[i]/255);
    result[i+1]=Math.round(source[i+1]*paint[i+1]/255);
    result[i+2]=Math.round(source[i+2]*paint[i+2]/255);
    result[i+3]=source[i+3];
  }
  return result;
}
