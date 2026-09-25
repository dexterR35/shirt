import { Zip, ZipPassThrough } from "fflate";
import { kitItem, slug } from "./catalog.js";
import { loadKit } from "./kit-config.js";
import { EXPORT_SIZES, exportDimensions, renderImage } from "./export.js";
import { validateLighting } from "./composite.js";
import { validateShirtView, viewFilenameSuffix } from './shirt-view.js';
import { facingForVariant } from './perspective-shirt.js';

/** Portable filenames, with Home and Away kept as separate PNG files. */
export function tier1Filename(item) {
  if (!item.team_name || !["home", "away"].includes(item.variant))
    throw Error("A team name and Home/Away variant are required.");
  return `${slug(item.team_name).replaceAll("-", "_")}_${item.variant}.png`;
}

/** All mandatory teams, independent of navigation filters and the ten-kit collection. */
export function tier1Items(teams) {
  const items = [], names = new Set();
  for (const team of teams.filter((t) => t.mandatory)) {
    for (const variant of ["home", "away"]) {
      const item = kitItem(team, variant);
      if (item.status !== "ready" || !item.details_path)
        throw Error(`${team.name} ${variant} is not ready. The complete Tier 1 ZIP cannot be exported yet.`);
      const name = tier1Filename(item);
      if (names.has(name)) throw Error(`Duplicate export name: ${name}. No files were downloaded.`);
      names.add(name);
      items.push(item);
    }
  }
  if (!items.length) throw Error("No Tier 1 teams are available in this catalog.");
  return items;
}

/**
 * Render saved kits sequentially and store each PNG directly in the ZIP.
 * Blob chunks avoid keeping all rendered images plus a second full ZIP byte array.
 * Cancellation or a failed kit discards the archive; callers only download on success.
 * @param {Array<object>} items Validated output of tier1Items.
 * @param {{size: number, ratio?: string, lighting?: number, signal?: AbortSignal,
 *   onProgress?: Function, load?: Function, render?: Function}} options
 * @returns {Promise<Blob>}
 */
export async function renderTier1Zip(items, {
  size, ratio = "1:1", lighting = 0, view = 'front', signal, onProgress = () => {}, load = loadKit, render = renderImage,
}) {
  if (!items.length) throw Error("No Tier 1 kits to download.");
  if (!EXPORT_SIZES.includes(size)) throw Error("Choose one of the offered download sizes.");
  exportDimensions(size, ratio);
  validateLighting(lighting);
  validateShirtView(view);
  const names = items.map(item => tier1Filename(item).replace(/\.png$/, `${viewFilenameSuffix(view)}.png`));
  if (new Set(names).size !== names.length) throw Error("Duplicate export names. No files were downloaded.");
  const chunks = [];
  const zip = new Zip((error, chunk) => {
    if (error) throw error;
    chunks.push(new Blob([chunk]));
  });
  try {
    for (const [index, item] of items.entries()) {
      signal?.throwIfAborted();
      onProgress(index, items.length, item);
      try {
        const { config } = await load(item, signal);
        signal?.throwIfAborted();
        const png = await render(config, size, "png", ratio, lighting, view, facingForVariant(item.variant));
        signal?.throwIfAborted();
        const bytes = new Uint8Array(await png.arrayBuffer());
        signal?.throwIfAborted();
        const file = new ZipPassThrough(names[index]);
        zip.add(file);
        file.push(bytes, true);
      } catch (error) {
        if (signal?.aborted) signal.throwIfAborted();
        throw Error(`${item.team_name} ${item.variant}: ${error.message}. No ZIP was downloaded.`, { cause: error });
      }
    }
    signal?.throwIfAborted();
    zip.end();
    return new Blob(chunks, { type: "application/zip" });
  } finally {
    zip.terminate();
    chunks.length = 0;
  }
}
