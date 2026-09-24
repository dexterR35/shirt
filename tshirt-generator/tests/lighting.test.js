import test from "node:test";
import assert from "node:assert/strict";
import { compositePixels, validateLighting } from "../src/lib/composite.js";

test("lighting preserves alpha, fabric contrast and paint colors without clipping highlights", () => {
  const source = new Uint8ClampedArray(256 * 4);
  const paint = new Uint8ClampedArray(source.length);
  for (let value = 0; value < 256; value++) {
    source.set([value, value, value, value], value * 4);
    paint.set([220, 50, 0, 255], value * 4);
  }
  const original = compositePixels(source, paint);
  const light = compositePixels(source, paint, 200);
  const dark = compositePixels(source, paint, 50);
  for (let i = 0; i < source.length; i += 4) {
    assert.equal(original[i], Math.round(source[i] * 220 / 255));
    assert.equal(light[i + 3], source[i + 3]);
    assert.equal(dark[i + 3], source[i + 3]);
    assert.ok(light[i] >= original[i] && dark[i] <= original[i]);
    assert.ok(light[i] <= 220 && light[i + 1] <= 50);
    assert.equal(light[i + 2], 0); // light never adds white over painted black
  }
  assert.ok(light[64 * 4] < light[128 * 4] && light[128 * 4] < light[192 * 4]);
  assert.deepEqual(compositePixels(source), source);
  assert.ok(compositePixels(source, null, 200)[128 * 4] > source[128 * 4]);
  assert.deepEqual(source.slice(128 * 4, 128 * 4 + 4), new Uint8ClampedArray([128, 128, 128, 128]));
  for (const value of [NaN, Infinity, 0, 49, 201, "150", null])
    assert.throws(() => validateLighting(value), /Lighting must be/);
});
