/**
 * Render worker: decodes the base photo, composites kit paint into it and encodes
 * downloads, all off the page's main thread (OffscreenCanvas). The page sends the
 * base file (a Blob) and the kit paint already rasterized (an ImageBitmap), because
 * browsers cannot draw SVG inside a worker.
 *
 * Message in:  {id, size, base:{path, blob, width, height, x, y, span}, paint?:ImageBitmap,
 *               lighting?:number, encode?:{type, label, width, height}}
 * Message out: {id, pixels:ImageData} (square render) | {id, blob:Blob} (encoded) | {id, error}
 */
import { compositePixels, paintArea } from "./composite.js";
import { perspectivePixels } from './perspective-shirt.js';

/**
 * AVIF: full-resolution color (4:4:4, so stripe and trim edges keep their color),
 * quality 95 for color and exact transparency (alpha 100), so soft shirt edges match
 * the PNG. Measured on 2048 kits: color PSNR ≈ 52 dB (visually identical), about a
 * tenth of the PNG size, ~1.3 s to encode. Lossless AVIF is not used: it is larger than PNG.
 */
const AVIF_OPTIONS = Object.freeze({ quality: 95, qualityAlpha: 100, subsample: 3, speed: 8, bitDepth: 8 });

const bitmaps = new Map(); // base path -> Promise<ImageBitmap>, decoded once per worker
const surfaces = new Map(); // "path@size" -> base ImageData at that size (two at most)

function baseBitmap({ path, blob, width, height }) {
  if (!bitmaps.has(path))
    bitmaps.set(
      path,
      createImageBitmap(blob)
        .catch(() => {
          throw Error("The high-resolution PNG base could not be loaded. Retry the preview.");
        })
        .then((bitmap) => {
          if (bitmap.width !== width || bitmap.height !== height)
            throw Error("The PNG base dimensions do not match the saved master.");
          return bitmap;
        })
        .catch((error) => {
          bitmaps.delete(path);
          throw error;
        }),
    );
  return bitmaps.get(path);
}

/** The shirt photo at `size`: the 200-unit square scaled into the paint area. */
async function basePixels(base, size) {
  const key = `${base.path}@${size}`;
  if (surfaces.has(key)) return surfaces.get(key);
  const bitmap = await baseBitmap(base);
  const ctx = new OffscreenCanvas(size, size).getContext("2d", { willReadFrequently: true });
  const { margin, span } = paintArea(size);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, base.x, base.y, base.span, base.span, margin, margin, span, span);
  const pixels = ctx.getImageData(0, 0, size, size);
  if (surfaces.size >= 2) surfaces.delete(surfaces.keys().next().value);
  surfaces.set(key, pixels);
  return pixels;
}

async function render({ size, base, paint, lighting = 0, view = 'front', facing = 'right' }) {
  const source = await basePixels(base, size);
  let colors = null;
  if (paint) {
    const ctx = new OffscreenCanvas(size, size).getContext("2d", { willReadFrequently: true });
    ctx.drawImage(paint, 0, 0); paint.close();
    colors = ctx.getImageData(0, 0, size, size).data;
  }
  const front = compositePixels(source.data, colors, lighting);
  return new ImageData(view === 'three-quarter' ? perspectivePixels(front, size, {...paintArea(size), facing}) : front, size, size);
}

/** Center the square render on a transparent canvas of the requested shape and encode it. */
async function encode(pixels, { type, label, width, height }) {
  const canvas = new OffscreenCanvas(width, height), ctx = canvas.getContext("2d");
  ctx.putImageData(pixels, Math.floor((width - pixels.width) / 2), Math.floor((height - pixels.height) / 2));
  if (type === "image/avif") {
    // The AVIF encoder (WebAssembly) loads only when AVIF is first chosen.
    const { default: encodeAvif } = await import("@jsquash/avif/encode.js");
    return new Blob([await encodeAvif(ctx.getImageData(0, 0, width, height), AVIF_OPTIONS)], { type });
  }
  // Quality 1 asks for lossless WebP; PNG is always lossless.
  const blob = await canvas.convertToBlob({ type, quality: 1 });
  // A browser that cannot encode the format returns PNG instead; never mislabel it.
  if (blob.type !== type) throw Error(`This browser cannot create ${label} files. Choose PNG.`);
  return blob;
}

self.onmessage = async ({ data: job }) => {
  try {
    const pixels = await render(job);
    if (!job.encode) self.postMessage({ id: job.id, pixels }, [pixels.data.buffer]);
    else self.postMessage({ id: job.id, blob: await encode(pixels, job.encode) });
  } catch (error) {
    job.paint?.close();
    self.postMessage({ id: job.id, error: error?.message || "The shirt could not be rendered." });
  }
};
