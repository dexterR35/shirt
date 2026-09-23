import { zipSync } from "fflate";
import { renderPngPreview } from "./png-preview.js";
import { assetFilename } from "./catalog.js";

/** Square PNG sizes offered for download. Above 2048 the 8K master is used. */
export const EXPORT_SIZES = [512, 1024, 2048, 4096];

/** Same composite as the preview (PNG fabric × paint), rendered at `size`, as a PNG blob. */
export async function renderPng(config, size) {
  if (!EXPORT_SIZES.includes(size)) throw Error("Choose one of the offered download sizes.");
  const pixels = await renderPngPreview(config, size, { cache: false });
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  canvas.getContext("2d").putImageData(pixels, 0, 0);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(Error("The PNG could not be created."))), "image/png"),
  );
}

/** e.g. england-arsenal-team_…-2026-27-home-r001-2048px.png (plus -custom when recolored). */
export function exportFilename(item, size, custom = false) {
  return assetFilename(item, "png").replace(/\.png$/, `-${size}px${custom ? "-custom" : ""}.png`);
}

/** Bundle PNGs into one ZIP. PNG is already compressed, so files are stored as-is. */
export async function zipFiles(files) {
  const entries = {};
  for (const { name, blob } of files) entries[name] = [new Uint8Array(await blob.arrayBuffer()), { level: 0 }];
  return new Blob([zipSync(entries)], { type: "application/zip" });
}
