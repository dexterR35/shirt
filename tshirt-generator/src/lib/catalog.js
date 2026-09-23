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
export const revisionKey = (item) =>
  `${item.team_id}:${item.variant}:${item.revision}`;
export function addToSelection(selection, item) {
  if (item.status !== "ready")
    throw new Error("This kit is not ready to export.");
  if (selection.some((v) => revisionKey(v) === revisionKey(item)))
    throw new Error("This kit is already in your collection.");
  if (selection.length >= 10)
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
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
