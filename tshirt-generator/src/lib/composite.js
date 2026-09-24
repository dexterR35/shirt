/** Pixel maths shared by the page and the render worker (no DOM, no imports). */

/** Where the 200-unit paint square sits in a square render of `size` pixels. */
export function paintArea(size) {
  return { margin: size / 16, span: (size * 7) / 8 };
}

/** Multiply only RGB, preserving every original alpha value (including edges).
 * White paint reproduces the source exactly. Inputs are unpremultiplied RGBA.
 * @param {Uint8Array|Uint8ClampedArray} source
 * @param {Uint8Array|Uint8ClampedArray} paint
 * @returns {Uint8ClampedArray}
 */
export function compositePixels(source, paint) {
  if (source.length !== paint.length || source.length % 4) throw Error("RGBA buffers must match");
  const result = new Uint8ClampedArray(source.length);
  for (let i = 0; i < source.length; i += 4) {
    result[i] = Math.round((source[i] * paint[i]) / 255);
    result[i + 1] = Math.round((source[i + 1] * paint[i + 1]) / 255);
    result[i + 2] = Math.round((source[i + 2] * paint[i + 2]) / 255);
    result[i + 3] = source[i + 3];
  }
  return result;
}
