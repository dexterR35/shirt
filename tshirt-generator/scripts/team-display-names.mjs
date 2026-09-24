import fs from "node:fs/promises";

/**
 * Display names from data/team-display-names.json, applied on top of the preserved
 * source teams. Returns (team) => {name, aliases}: the corrected name, with the
 * source name kept as a searchable alias. A stale entry (source name changed) fails.
 */
export async function loadDisplayNames(teams) {
  const { names } = JSON.parse(await fs.readFile("data/team-display-names.json", "utf8"));
  for (const [id, entry] of Object.entries(names)) {
    const team = teams.find((t) => t.id === id);
    if (!team || team.name !== entry.source_name || typeof entry.name !== "string" || !entry.name.trim())
      throw Error(`Display name no longer matches its source team: ${id}`);
  }
  return (team) => {
    const entry = names[team.id];
    return entry
      ? { name: entry.name, aliases: [...new Set([...(team.aliases || []), team.name])] }
      : { name: team.name, aliases: team.aliases || [] };
  };
}
