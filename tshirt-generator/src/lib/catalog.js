export function normalizeSearch(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/ø/g, "o")
    .replace(/ł/g, "l")
    .replace(/đ/g, "d")
    .toLowerCase()
    .trim();
}
export function filterTeams(teams, country, query) {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  return teams.filter(
    (team) =>
      (!country || team.country_id === country) &&
      terms.every((term) =>
        normalizeSearch(
          `${team.name} ${team.country_name} ${(team.aliases || []).join(" ")}`,
        ).includes(term),
      ),
  );
}
/** Most kits a collection holds (Home and Away are separate slots). */
export const COLLECTION_LIMIT = 10;
export const variantLabel = (variant) => (variant === "home" ? "Home" : "Away");
export const hasReadyKit = (team) => Object.values(team.kits).some((k) => k.status === "ready");
/** A team's Home or Away slot as a standalone kit item (preview, collection, reviews). */
export function kitItem(team, variant) {
  return { ...team.kits[variant], team_id: team.id, team_name: team.name, country_name: team.country_name, variant };
}
/** Identity of a kit revision in the collection. */
export const revisionKey = (item) =>
  `${item.team_id}:${item.variant}:${item.revision}`;
/** Identity of the exact kit version shown: revision plus PNG layout (cache, reviews, edits). */
export const kitKey = (item) => `${revisionKey(item)}:${item.png_layout_revision || "original"}`;
export function addToSelection(selection, item) {
  if (item.status !== "ready")
    throw new Error("This kit is not ready to export.");
  if (selection.some((v) => revisionKey(v) === revisionKey(item)))
    throw new Error("This kit is already in your collection.");
  if (selection.length >= COLLECTION_LIMIT)
    throw new Error(
      "Your collection is full. Remove a kit before adding another.",
    );
  return [...selection, item];
}
export function slug(value) {
  return (
    normalizeSearch(value)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "team"
  );
}
export function assetFilename(item, extension = "png") {
  return `${slug(item.country_name)}-${slug(item.team_name)}-${item.team_id}-${slug(item.kit_season)}-${item.variant}-${item.revision}.${extension}`;
}
