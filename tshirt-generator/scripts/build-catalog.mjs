import fs from "node:fs/promises";
import crypto from "node:crypto";
import { renderShirt, neutralConfig } from "../src/lib/shirt-renderer.js";
import { assetFilename } from "../src/lib/catalog.js";
const read = async (f) => JSON.parse(await fs.readFile(f, "utf8"));
const teams = await read("data/normalized/teams.json"),
  countries = await read("data/normalized/countries.json"),
  queue = await read("data/research/kit-research-queue.json");
await fs.mkdir("public/catalog", { recursive: true });
await fs.mkdir("public/assets/shirts", { recursive: true });
await fs.mkdir("public/catalog/kits", { recursive: true });
const files = await fs.readdir("data/kits");
const revisions = [];
for (const file of files.filter((f) => f.endsWith(".json"))) {
  const revision = await read(`data/kits/${file}`);
  if (
    !teams.some((t) => t.id === revision.team_id) ||
    !["home", "away"].includes(revision.variant) ||
    !/^r\d{3}$/.test(revision.revision)
  )
    throw Error(`Invalid revision ${file}`);
  if (
    revision.status === "ready" &&
    (!revision.kit_season ||
      !revision.references?.some(
        (r) => r.page_url && r.image_url && r.local_path,
      ) ||
      !revision.visual_review?.reviewed_at ||
      !revision.color_evidence)
  )
    throw Error(`Missing evidence for ${file}`);
  const svg = renderShirt(
      revision.config,
      `${revision.team_name} · ${revision.kit_season} · ${revision.variant}`,
      revision.surface_version ?? "original-png-vector-1",
    ),
    filename = assetFilename(revision);
  const svgPath = `public/assets/shirts/${filename}`;
  try {
    const existing = await fs.readFile(svgPath, "utf8");
    if (existing !== svg && revision.status === "ready")
      throw Error(
        `Immutable revision changed: ${filename}. Create a new revision.`,
      );
    if (existing !== svg) await fs.writeFile(svgPath, svg);
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    await fs.writeFile(svgPath, svg);
  }
  const saved = {
    ...revision,
    svg_path: `/assets/shirts/${filename}`,
    sha256: crypto.createHash("sha256").update(svg).digest("hex"),
  };
  await fs.writeFile(
    `public/catalog/kits/${revision.team_id}-${revision.variant}-${revision.revision}.json`,
    JSON.stringify(saved),
  );
  revisions.push(saved);
}
const results = new Map();
for (const file of (await fs.readdir("data/research/results")).filter((f) =>
  f.endsWith(".json"),
)) {
  const r = await read(`data/research/results/${file}`);
  results.set(r.task_id, r);
}
let searched = new Set();
for (const file of (await fs.readdir("data/research/discovery")).filter((f) =>
  f.endsWith(".json"),
)) {
  const r = await read(`data/research/discovery/${file}`);
  if (typeof r.response === "string" && r.response.length > 100)
    r.tasks.forEach((t) => searched.add(t.id));
}
const manifestTeams = teams.map((t) => ({
  id: t.id,
  name: t.name,
  country_id: t.country_id,
  country_name: t.country_name,
  aliases: t.aliases,
  reserve: t.source_team_types.includes("Reserve team"),
  kits: Object.fromEntries(
    ["home", "away"].map((variant) => {
      const task = queue.find(
          (q) => q.team_id === t.id && q.kit_variant === variant,
        ),
        r = revisions
          .filter((r) => r.team_id === t.id && r.variant === variant)
          .sort((a, b) => b.revision.localeCompare(a.revision))[0],
        result = results.get(task.id);
      return [
        variant,
        r
          ? {
              status: r.status,
              kit_season: r.kit_season,
              revision: r.revision,
              details_path: `/catalog/kits/${t.id}-${variant}-${r.revision}.json`,
              svg_path: r.svg_path,
              sha256: r.sha256,
            }
          : {
              status:
                result?.status ??
                (searched.has(task.id) ? "researching" : "unresearched"),
              kit_season: null,
              reason:
                result?.reason ??
                (searched.has(task.id)
                  ? "Search completed; official season, colors and front-view artwork still need visual review."
                  : "This kit is awaiting source research."),
              task_id: task.id,
            },
      ];
    }),
  ),
}));
const counts = {
  teams: teams.length,
  countries: countries.length,
  slots: queue.length,
  ready: manifestTeams
    .flatMap((t) => Object.values(t.kits))
    .filter((k) => k.status === "ready").length,
  discovery_searched: searched.size,
  blocked: [...results.values()].filter((r) => r.status === "blocked").length,
};
const manifest = {
  schemaVersion: 1,
  generated_at: new Date().toISOString(),
  counts,
  countries: countries.map((c) => ({
    ...c,
    team_count: teams.filter((t) => t.country_id === c.id).length,
  })),
  teams: manifestTeams,
};
await fs.writeFile("public/catalog/manifest.json", JSON.stringify(manifest));
await fs.writeFile(
  "public/assets/shirts/original-master.svg",
  renderShirt(neutralConfig()),
);
await fs.writeFile(
  "data/research/progress.json",
  JSON.stringify(
    {
      ...counts,
      remaining_visual_reviews: queue.length - counts.ready,
      note: "Discovery searches and seed-link checks do not certify kit artwork.",
    },
    null,
    2,
  ) + "\n",
);
console.log(counts);
