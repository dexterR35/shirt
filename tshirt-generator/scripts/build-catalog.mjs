import fs from "node:fs/promises";
import crypto from "node:crypto";
import { renderShirt, neutralConfig } from "../src/lib/shirt-renderer.js";
import { validatePngLayout } from "../src/lib/png-layout.js";
import { buildTeamEquipment } from "./research/build-team-equipment.mjs";
import { equipmentForKit } from "../src/lib/equipment.js";
import { loadDisplayNames } from "./team-display-names.mjs";
import { permittedSeason } from "./research/season-policy.mjs";
const {teams: equipmentTeams, priority} = await buildTeamEquipment();
const read = async (f) => JSON.parse(await fs.readFile(f, "utf8"));
const teams = await read("data/normalized/teams.json"),
  countries = await read("data/normalized/countries.json"),
  queue = await read("data/research/kit-research-queue.json");
const tier2Ids = new Set((await read("data/research/tier2-worklist.json")).tasks.map((t) => t.team_id)),
  tier3Ids = new Set((await read("data/research/tier3-worklist.json")).tasks.map((t) => t.team_id));
await fs.mkdir("public/catalog", { recursive: true });
await fs.mkdir("public/catalog/kits", { recursive: true });
await fs.mkdir("public/catalog/teams", { recursive: true });
for (const [id, data] of equipmentTeams) {
  await fs.writeFile(`public/catalog/teams/${id}.json`, JSON.stringify(data));
}
const files = await fs.readdir("data/kits");
const configLockPath = "data/kit-config-lock.json";
let configLock = {};
try { configLock = await read(configLockPath); } catch (e) { if (e.code !== "ENOENT") throw e; }
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
  // Ready revisions are immutable: their paint configuration is locked by hash.
  const configHash = crypto.createHash("sha256").update(JSON.stringify(revision.config)).digest("hex");
  if (revision.status === "ready") {
    if (configLock[file] && configLock[file] !== configHash)
      throw Error(`Immutable revision changed: ${file}. Create a new revision.`);
    configLock[file] = configHash;
  }
  const saved = { ...revision };
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
const displayName = await loadDisplayNames(teams);
const manifestTeams = teams.map((t) => ({
  id: t.id,
  ...displayName(t),
  country_id: t.country_id,
  country_name: t.country_name,
  mandatory: equipmentTeams.get(t.id).mandatory,
  priority_order: equipmentTeams.get(t.id).priority_order,
  tier2: tier2Ids.has(t.id),
  tier3: tier3Ids.has(t.id),
  equipment_path: `/catalog/teams/${t.id}.json`,
  reserve: t.source_team_types.includes("Reserve team"),
  kits: Object.fromEntries(
    ["home", "away"].map((variant) => {
      const task = queue.find(
          (q) => q.team_id === t.id && q.kit_variant === variant,
        ),
        r = revisions
          .filter((r) => r.team_id === t.id && r.variant === variant &&
            (!equipmentTeams.get(t.id).mandatory || permittedSeason(t.id,variant,r.kit_season,priority.requested_season)))
          .sort((a, b) => Number(b.kit_season===priority.requested_season)-Number(a.kit_season===priority.requested_season)||b.revision.localeCompare(a.revision))[0],
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
            }
          : {
              status:
                (equipmentTeams.get(t.id).mandatory && result?.kit_season && !permittedSeason(t.id,variant,result.kit_season,priority.requested_season) ? 'researching' : result?.status) ??
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
// Team-list avatar colors come only from a ready kit's own paint (Home first), never
// from workbook palettes: body fills the circle, the sleeves (or collar) form the ring.
for (const t of manifestTeams) {
  const variant = ["home", "away"].find((v) => t.kits[v].status === "ready");
  if (!variant) continue;
  const r = revisions.find((r) => r.team_id === t.id && r.variant === variant && r.revision === t.kits[variant].revision);
  const { colors } = r.png_layout?.config ?? r.config;
  const ring = [colors.leftSleeve, colors.collar].find((c) => c.toUpperCase() !== colors.body.toUpperCase()) ?? colors.body;
  if (![colors.body, ring].every((c) => /^#[\da-f]{6}$/i.test(c))) throw Error(`Invalid avatar colors: ${t.id}`);
  t.avatar = { variant, body: colors.body.toUpperCase(), ring: ring.toUpperCase() };
}
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
  mandatory_preferred_season: manifestTeams.filter(t=>t.mandatory).flatMap(t=>Object.values(t.kits)).filter(k=>k.status==='ready'&&k.kit_season===priority.requested_season).length,
  mandatory_fallbacks: manifestTeams.filter(t=>t.mandatory).flatMap(t=>Object.values(t.kits)).filter(k=>k.status==='ready'&&k.kit_season!==priority.requested_season).length,
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
// Catalog tabs: competitions grouped by country (plus UEFA), with each kit's display facts.
const competitions = await read("data/normalized/competitions.json"),
  memberships = await read("data/normalized/memberships.json");
const groups = [];
for (const c of competitions) {
  const groupName = c.scope === "UEFA" ? "UEFA" : c.country_or_system;
  let group = groups.find((g) => g.name === groupName);
  if (!group) groups.push((group = { id: groupName.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name: groupName, competitions: [] }));
  const slug = c.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (group.competitions.some((x) => x.slug === slug)) throw Error(`Duplicate competition slug in ${groupName}: ${slug}`);
  group.competitions.push({
    id: c.id,
    slug,
    name: c.name,
    season: c.season,
    tier: c.tier,
    team_ids: memberships.filter((m) => m.competition_id === c.id).map((m) => m.team_id),
  });
}
for (const g of groups) g.competitions.sort((a, b) => (a.tier ?? 0) - (b.tier ?? 0));
const kitFacts = (k) => k ? { season: k.season ?? null, brand: k.brand ?? null, colors: k.colors ?? [], design: k.design ?? null } : null;
const facts = Object.fromEntries([...new Set(memberships.map((m) => m.team_id))].map((id) => {
  const kits = equipmentTeams.get(id)?.kits;
  return [id, { home: kitFacts(kits?.home), away: kitFacts(kits?.away) }];
}));
await fs.writeFile("public/catalog/competitions.json", JSON.stringify({ schemaVersion: 1, groups, facts }));
await fs.writeFile(configLockPath, JSON.stringify(Object.fromEntries(Object.entries(configLock).sort()), null, 2) + "\n");
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
