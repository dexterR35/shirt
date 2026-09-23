import { kitPreviewConfig } from "./png-layout.js";
import { equipmentForKit } from "./equipment.js";

const kits = new Map();

/** One key per exact kit version: team, variant, revision and PNG layout. */
export const kitKey = (item) =>
  `${item.team_id}:${item.variant}:${item.revision}:${item.png_layout_revision || "original"}`;

export async function loadJson(url, signal) {
  const r = await fetch(url, { signal });
  if (!r.ok) throw Error(`Could not load the local catalog (${r.status}).`);
  return r.json();
}

/**
 * A ready kit's validated paint config and equipment facts, shared by the preview,
 * downloads and catalog thumbnails. Only successful loads are cached, so a failed
 * or aborted request is retried next time.
 */
export async function loadKit(item, signal) {
  const key = kitKey(item);
  if (kits.has(key)) return kits.get(key);
  const details = await loadJson(item.details_path, signal);
  const kit = { config: kitPreviewConfig(details, item), equipment: equipmentForKit(details.equipment, item) };
  kits.set(key, kit);
  return kit;
}
