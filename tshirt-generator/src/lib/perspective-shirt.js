/**
 * A flat perspective presentation of the original photograph, not a new garment.
 * Transform fabric and paint TOGETHER after compositing; straight lines remain
 * straight and collar/cuff paint cannot drift relative to the sewn fabric.
 */
const SCALE = .93, WIDTH = .82, DEPTH = .16;

export function validateFacing(facing) {
  if (!['right', 'left'].includes(facing)) throw Error('Choose a left or right facing shirt.');
  return facing;
}
export const facingForVariant = variant => variant === 'away' ? 'left' : 'right';

/** 200-unit source paint coordinates -> angled coordinates. */
export function perspectivePoint(u, v, facing = 'right') {
  validateFacing(facing);
  const denominator = 1 + DEPTH * (u - 100) / 100;
  const x = 100 + SCALE * WIDTH * (u - 100) / denominator;
  return [facing === 'left' ? 200 - x : x, 100 + SCALE * (v - 100) / denominator];
}

/** Exact inverse for the renderer and clickable color regions. */
export function perspectiveSource(u, v, facing = 'right') {
  validateFacing(facing);
  const dx = ((facing === 'left' ? 200 - u : u) - 100) / (SCALE * WIDTH);
  const x = dx / (1 - DEPTH * dx / 100);
  return [100 + x, 100 + (v - 100) * (1 + DEPTH * x / 100) / SCALE];
}

/**
 * Reproject a square RGBA buffer once, with alpha-correct bilinear sampling.
 * Nearest sampling is reserved for hidden ID colors used by the color editor.
 * @param {Uint8Array|Uint8ClampedArray} source
 * @param {number} size
 * @param {{margin?:number,span?:number,facing?:string,nearest?:boolean}} options
 */
export function perspectivePixels(source, size, {margin=0,span=size,facing='right',nearest=false}={}) {
  validateFacing(facing);
  if (!Number.isInteger(size) || size < 1 || source.length !== size * size * 4 || !(span > 0))
    throw Error('Perspective rendering needs a square RGBA buffer.');
  const out = new Uint8ClampedArray(source.length);
  for (let x = 0; x < size; x++) {
    const [u] = perspectiveSource((x + .5 - margin) * 200 / span, 100, facing);
    const px = margin + u * span / 200 - .5;
    if (px < 0 || px > size - 1) continue;
    const x0 = Math.floor(px), x1 = Math.min(size - 1, x0 + 1), fx = px - x0;
    const denominator = 1 + DEPTH * (u - 100) / 100;
    for (let y = 0; y < size; y++) {
      const v = (y + .5 - margin) * 200 / span;
      const py = margin + (100 + (v - 100) * denominator / SCALE) * span / 200 - .5;
      if (py < 0 || py > size - 1) continue;
      const p = (y * size + x) * 4;
      if (nearest) {
        const i = (Math.round(py) * size + Math.round(px)) * 4;
        out.set(source.subarray(i, i + 4), p); continue;
      }
      const y0 = Math.floor(py), y1 = Math.min(size - 1, y0 + 1), fy = py - y0;
      const ids = [(y0*size+x0)*4,(y0*size+x1)*4,(y1*size+x0)*4,(y1*size+x1)*4];
      const weights = [(1-fx)*(1-fy),fx*(1-fy),(1-fx)*fy,fx*fy];
      let alpha = 0;
      for (let i=0;i<4;i++) alpha += source[ids[i]+3] * weights[i];
      if (!alpha) continue;
      out[p+3] = Math.round(alpha);
      for (let k=0;k<3;k++) {
        let color = 0;
        for (let i=0;i<4;i++) color += source[ids[i]+k] * source[ids[i]+3] * weights[i];
        out[p+k] = Math.round(color / alpha);
      }
    }
  }
  return out;
}
