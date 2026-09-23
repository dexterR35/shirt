import fs from "node:fs/promises";
import crypto from "node:crypto";
import { renderShirt, neutralConfig } from "../src/lib/shirt-renderer.js";
import { assetFilename } from "../src/lib/catalog.js";
import { validatePngLayout } from "../src/lib/png-layout.js";
import { buildTeamEquipment } from "./research/build-team-equipment.mjs";
import { equipmentForKit } from "../src/lib/equipment.js";
const {teams: equipmentTeams, priority} = await buildTeamEquipment();
const read = async (f) => JSON.parse(await fs.readFile(f, "utf8"));
const teams = await read("data/normalized/teams.json"),
  countries = await read("data/normalized/countries.json"),
  queue = await read("data/research/kit-research-queue.json");
await fs.mkdir("public/catalog", { recursive: true });
await fs.mkdir("public/assets/shirts", { recursive: true });
await fs.mkdir("public/catalog/kits", { recursive: true });
await fs.mkdir("public/catalog/teams", { recursive: true });
for (const [id, data] of equipmentTeams) {
  await fs.writeFile(`public/catalog/teams/${id}.json`, JSON.stringify(data));
}
const files = await fs.readdir("data/kits");
const revisions = [];
const layouts = [];
for (const file of (await fs.readdir('data/kits/png-layouts')).filter(f => f.endsWith('.json'))) {
  const layout = await read(`data/kits/png-layouts/${file}`);
  if (layout.status !== 'reviewed') continue;
  const parent = await read(`data/kits/${layout.team_id}-${layout.variant}-${layout.source_revision}.json`);
  validatePngLayout(layout, parent);
  for (const ref of layout.references) {
    const hash = crypto.createHash('sha256').update(await fs.readFile(ref.local_path)).digest('hex');
    if (hash !== ref.sha256) throw Error(`PNG layout reference changed: ${file}`);
  }
  if (layouts.some(l => l.team_id === layout.team_id && l.variant === layout.variant && l.source_revision === layout.source_revision && l.layout_revision === layout.layout_revision))
    throw Error(`Duplicate PNG layout: ${file}`);
  layouts.push(layout);
}
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
  const equipment = equipmentTeams.get(revision.team_id)?.kits[revision.variant];
  // Never attach another season's metadata to an applied historical revision.
  if (equipment?.season === revision.kit_season) saved.equipment = equipmentForKit(equipment,revision);
  const layout = layouts.filter(l => l.team_id === revision.team_id && l.variant === revision.variant && l.source_revision === revision.revision)
    .sort((a,b) => b.layout_revision.localeCompare(a.layout_revision))[0];
  if (layout) {
    saved.png_layout = layout;
    saved.png_layout_revision = layout.layout_revision;
  }
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
  mandatory: equipmentTeams.get(t.id).mandatory,
  priority_order: equipmentTeams.get(t.id).priority_order,
  equipment_path: `/catalog/teams/${t.id}.json`,
  reserve: t.source_team_types.includes("Reserve team"),
  kits: Object.fromEntries(
    ["home", "away"].map((variant) => {
      const task = queue.find(
          (q) => q.team_id === t.id && q.kit_variant === variant,
        ),
        r = revisions
          .filter((r) => r.team_id === t.id && r.variant === variant &&
            (!equipmentTeams.get(t.id).mandatory || r.kit_season === priority.requested_season))
          .sort((a, b) => b.revision.localeCompare(a.revision))[0],
        result = results.get(task.id);
      return [
        variant,
        r
          ? {
              status: r.status,
              kit_season: r.kit_season,
              revision: r.revision,
              ...(r.png_layout_revision ? {png_layout_revision: r.png_layout_revision} : {}),
              details_path: `/catalog/kits/${t.id}-${variant}-${r.revision}.json`,
              svg_path: r.svg_path,
              sha256: r.sha256,
            }
          : {
              status:
                (equipmentTeams.get(t.id).mandatory && result?.kit_season && result.kit_season !== priority.requested_season ? 'researching' : result?.status) ??
                (searched.has(task.id) ? "researching" : "unresearched"),
              kit_season: null,
              reason:
                equipmentTeams.get(t.id).kits[variant].source_issue?.outcome ?? result?.reason ??
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
  mandatory_teams: priority.team_count,
  mandatory_slots: priority.slot_count,
  mandatory_ready: manifestTeams.filter(t => t.mandatory).flatMap(t => Object.values(t.kits)).filter(k => k.status === 'ready').length,
  mandatory_references: [...equipmentTeams.values()].filter(t => t.mandatory).flatMap(t => Object.values(t.kits)).filter(k => k.source).length,
};
try {
  const archive = await read('data/research/footballkitarchive/progress.json');
  counts.fka_teams_searched = archive.teams_searched;
  counts.fka_references_saved = archive.references_saved;
  counts.fka_artwork_reviewed = archive.artwork_reviewed;
} catch (e) { if(e.code !== 'ENOENT') throw e; }
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
await fs.writeFile("starter/shirt-svg/base.svg", renderShirt(neutralConfig()));
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
// Priority affects research order, never membership in the full source catalog.
const priorityWorklist = [...manifestTeams].sort((a,b) =>
  Number(b.mandatory) - Number(a.mandatory) || (a.priority_order ?? 9999) - (b.priority_order ?? 9999));
await fs.writeFile('data/research/priority-worklist.json', JSON.stringify(priorityWorklist.flatMap(t =>
  ['home','away'].map(variant => ({team_id:t.id,team_name:t.name,country_name:t.country_name,variant,
    mandatory:t.mandatory,priority_order:t.priority_order,requested_season:t.mandatory?priority.requested_season:null,
    artwork_status:t.kits[variant].status,source_status:equipmentTeams.get(t.id).kits[variant].status,
    equipment_path:`data/teams/${t.id}.json`,task_id:queue.find(q=>q.team_id===t.id&&q.kit_variant===variant).id}))), null, 2)+'\n');
