/** Pixel maths shared by the page and the render worker (no DOM, no imports). */
export const LIGHTING_DEFAULT = 100, LIGHTING_MIN = 50, LIGHTING_MAX = 200;

export function validateLighting(lighting) {
  if (!Number.isFinite(lighting) || lighting < LIGHTING_MIN || lighting > LIGHTING_MAX)
    throw Error(`Lighting must be between ${LIGHTING_MIN}% and ${LIGHTING_MAX}%.`);
  return lighting;
}

/** Where the 200-unit paint square sits in a square render of `size` pixels. */
export function paintArea(size) {
  return { margin: size / 16, span: (size * 7) / 8 };
}

/** Multiply only RGB, preserving every original alpha value (including edges).
 * At 100% lighting, white paint reproduces the source exactly.
 * Lighting lifts/darkens fabric tones before paint, keeping color ceilings and
 * texture instead of clipping the finished colors. Inputs are unpremultiplied RGBA.
 * @param {Uint8Array|Uint8ClampedArray} source
 * @param {Uint8Array|Uint8ClampedArray|null} paint Null for the original shirt.
 * @param {number} lighting Fabric lighting percentage; 100 is the original.
 * @returns {Uint8ClampedArray}
 */
export function compositePixels(source, paint = null, lighting = LIGHTING_DEFAULT) {
  validateLighting(lighting);
  if ((paint && source.length !== paint.length) || source.length % 4) throw Error("RGBA buffers must match");
  const tones = Float64Array.from({length: 256}, (_, value) =>
    lighting === LIGHTING_DEFAULT ? value : 255 * Math.pow(value / 255, LIGHTING_DEFAULT / lighting));
  const result = new Uint8ClampedArray(source.length);
  for (let i = 0; i < source.length; i += 4) {
    result[i] = Math.round((tones[source[i]] * (paint ? paint[i] : 255)) / 255);
    result[i + 1] = Math.round((tones[source[i + 1]] * (paint ? paint[i + 1] : 255)) / 255);
    result[i + 2] = Math.round((tones[source[i + 2]] * (paint ? paint[i + 2] : 255)) / 255);
    result[i + 3] = source[i + 3];
  }
  return result;
}
