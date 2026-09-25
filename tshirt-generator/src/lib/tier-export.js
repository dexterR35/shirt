import { kitItem } from "./catalog.js";
import { tier1Filename } from "./tier1-export.js";

/**
 * Currently-ready Home/Away slots for a tier membership flag ("tier2" or "tier3").
 * Unlike tier1Items, an unfinished slot is skipped rather than blocking the whole export:
 * Tier 2 and Tier 3 research is ongoing, so a bulk download is necessarily partial.
 */
export function tierItems(teams, tierKey) {
  const items = [], names = new Set();
  for (const team of teams.filter((t) => t[tierKey])) {
    for (const variant of ["home", "away"]) {
      const item = kitItem(team, variant);
      if (item.status !== "ready" || !item.details_path) continue;
      const name = tier1Filename(item);
      if (names.has(name)) throw Error(`Duplicate export name: ${name}. No files were downloaded.`);
      names.add(name);
      items.push(item);
    }
  }
  if (!items.length) throw Error("No ready kits are available for this tier yet.");
  return items;
}
