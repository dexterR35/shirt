import { zipSync } from "fflate";
import { renderEncoded } from "./png-preview.js";
import { assetFilename } from "./catalog.js";

/** Download sizes: the image's longest side, in pixels. Above 2048 the 8K master is used. */
export const EXPORT_SIZES = [128, 168, 256, 512, 1024, 2048, 4096];

/** Image shapes. The shirt stays whole and centered; extra space is transparent. */
export const EXPORT_RATIOS = Object.freeze({
  "1:1": Object.freeze({ label: "1:1", name: "square", w: 1, h: 1 }),
  "4:5": Object.freeze({ label: "4:5", name: "portrait", w: 4, h: 5 }),
  "16:9": Object.freeze({ label: "16:9", name: "landscape", w: 16, h: 9 }),
  "9:16": Object.freeze({ label: "9:16", name: "story", w: 9, h: 16 }),
});

/** Width and height of a download: `size` is the longest side. */
export function exportDimensions(size, ratio = "1:1") {
  const shape = EXPORT_RATIOS[ratio];
  if (!shape) throw Error("Choose one of the offered image shapes.");
  return shape.w >= shape.h
    ? { width: size, height: Math.round((size * shape.h) / shape.w) }
    : { width: Math.round((size * shape.w) / shape.h), height: size };
}

/** "512px" for squares, "1024x1280px" otherwise; used in file names. */
const sizeTag = (size, ratio) => {
  const { width, height } = exportDimensions(size, ratio);
  return width === height ? `${width}px` : `${width}x${height}px`;
};

/**
 * Download formats. PNG is lossless everywhere; WebP is requested at quality 1, which
 * Chromium browsers encode losslessly (smaller files, same pixels); AVIF is encoded by a
 * WebAssembly encoder at high quality with full color resolution (smallest files,
 * visually identical, not bit-exact).
 */
export const EXPORT_FORMATS = Object.freeze({
  png: Object.freeze({ label: "PNG", type: "image/png", extension: "png" }),
  webp: Object.freeze({ label: "WebP", type: "image/webp", extension: "webp" }),
  avif: Object.freeze({ label: "AVIF", type: "image/avif", extension: "avif" }),
});

/**
 * Same composite as the preview (PNG fabric × paint) as an image blob. The shirt is
 * rendered square at the shorter side, so it is never cropped or stretched, and
 * centered on a transparent canvas of the chosen shape.
 */
export async function renderImage(config, size, format = "png", ratio = "1:1", lighting = 0) {
  if (!EXPORT_SIZES.includes(size)) throw Error("Choose one of the offered download sizes.");
  const spec = EXPORT_FORMATS[format];
  if (!spec) throw Error("Choose PNG, WebP or AVIF.");
  const { width, height } = exportDimensions(size, ratio);
  // Rendering and encoding run in the download worker, so the page never freezes.
  return renderEncoded(config, Math.min(width, height), { type: spec.type, label: spec.label, width, height }, lighting);
}

/** e.g. england-arsenal-team_…-2026-27-home-r001-2048px.webp or …-1152x2048px.png (plus -custom when recolored). */
export function exportFilename(item, size, format = "png", custom = false, ratio = "1:1") {
  return assetFilename(item, EXPORT_FORMATS[format].extension).replace(
    /\.\w+$/,
    `-${sizeTag(size, ratio)}${custom ? "-custom" : ""}.${EXPORT_FORMATS[format].extension}`,
  );
}

/** e.g. tshirt-kits-3-2048px-webp.zip */
export const zipFilename = (count, size, format, ratio = "1:1") => `tshirt-kits-${count}-${sizeTag(size, ratio)}-${format}.zip`;

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Bundle images into one ZIP. PNG and WebP are already compressed, so files are stored as-is. */
export async function zipFiles(files) {
  const entries = {};
  for (const { name, blob } of files) entries[name] = [new Uint8Array(await blob.arrayBuffer()), { level: 0 }];
  return new Blob([zipSync(entries)], { type: "application/zip" });
}
