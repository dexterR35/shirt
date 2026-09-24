import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import {
  filterTeams,
  addToSelection,
  revisionKey,
  assetFilename,
  kitItem,
  kitKey,
  hasReadyKit,
  COLLECTION_LIMIT,
} from "../src/lib/catalog.js";
const teams = JSON.parse(
  await fs.readFile("data/normalized/teams.json", "utf8"),
);
test("every source team remains searchable and country filters intersect with search", () => {
  assert.equal(filterTeams(teams, "", "").length, 735);
  for (const team of teams)
    assert.ok(
      filterTeams(teams, team.country_id, team.name).some(
        (t) => t.id === team.id,
      ),
    );
  assert.equal(new Set(teams.map((t) => t.country_id)).size, 39);
  const sample = [
    { name: "Știința Târgu Mureș", country_id: "ro", country_name: "Romania" },
  ];
  assert.equal(filterTeams(sample, "ro", "stiinta targu").length, 1);
  assert.equal(filterTeams(sample, "gb", "stiinta").length, 0);
});
test("batch size 1 and 10, explicit rejection of eleven and duplicates, Home/Away distinct", () => {
  let selection = [];
  for (let i = 0; i < 10; i++)
    selection = addToSelection(selection, {
      team_id: `team-${Math.floor(i / 2)}`,
      variant: i % 2 ? "away" : "home",
      revision: "r001",
      status: "ready",
    });
  assert.equal(selection.length, 10);
  assert.equal(new Set(selection.map(revisionKey)).size, 10);
  assert.throws(
    () =>
      addToSelection(selection, {
        team_id: "new",
        variant: "home",
        revision: "r001",
        status: "ready",
      }),
    /full/,
  );
  assert.throws(() => addToSelection([selection[0]], selection[0]), /already/);
  assert.throws(
    () => addToSelection([], { ...selection[0], status: "researching" }),
    /not ready/,
  );
});
test("export filenames include original identity, season, variant and revision without path traversal", () => {
  const name = assetFilename({
    country_name: "Romania",
    team_name: "../Știința",
    team_id: "team_123",
    kit_season: "2026/27",
    variant: "away",
    revision: "r001",
  });
  assert.equal(name, "romania-stiinta-team_123-2026-27-away-r001.png");
});
test("every ready kit revision keeps its locked paint configuration", async () => {
  const lock = JSON.parse(await fs.readFile("data/kit-config-lock.json", "utf8"));
  for (const file of (await fs.readdir("data/kits")).filter((f) => f.endsWith(".json"))) {
    const revision = JSON.parse(await fs.readFile(`data/kits/${file}`, "utf8"));
    if (revision.status !== "ready") continue;
    const hash = crypto.createHash("sha256").update(JSON.stringify(revision.config)).digest("hex");
    assert.equal(hash, lock[file], `${file} changed; create a new revision instead`);
  }
});

test("kit items carry their team; the kit key adds the PNG layout to the revision key", () => {
  const team = { id: "team_x", name: "X", country_name: "Y", kits: { home: { status: "ready", revision: "r002", png_layout_revision: "p001" }, away: { status: "missing" } } };
  const item = kitItem(team, "home");
  assert.deepEqual(item, { status: "ready", revision: "r002", png_layout_revision: "p001", team_id: "team_x", team_name: "X", country_name: "Y", variant: "home" });
  assert.equal(revisionKey(item), "team_x:home:r002");
  assert.equal(kitKey(item), "team_x:home:r002:p001");
  assert.equal(kitKey({ ...item, png_layout_revision: undefined }), "team_x:home:r002:original");
  assert.ok(hasReadyKit(team));
  assert.ok(!hasReadyKit({ kits: { home: { status: "missing" }, away: { status: "blocked" } } }));
  assert.equal(COLLECTION_LIMIT, 10);
});

test("display-name corrections change the shown name only; the source name stays searchable", async () => {
  const { names } = JSON.parse(await fs.readFile("data/team-display-names.json", "utf8"));
  const manifest = JSON.parse(await fs.readFile("public/catalog/manifest.json", "utf8"));
  for (const [id, entry] of Object.entries(names)) {
    assert.equal(teams.find((t) => t.id === id).name, entry.source_name, "source data is preserved");
    const shown = manifest.teams.find((t) => t.id === id);
    assert.equal(shown.name, entry.name);
    assert.deepEqual(filterTeams(manifest.teams, "", entry.source_name).map((t) => t.id), [id]);
  }
  assert.equal(manifest.teams.find((t) => t.id === "team_d509272aaa60d5a5b7dc").name, "FC Köln");
});

test("team avatars use a ready kit's own paint colors (Home first), and only ready kits", async () => {
  const manifest = JSON.parse(await fs.readFile("public/catalog/manifest.json", "utf8"));
  let withAvatar = 0;
  for (const team of manifest.teams) {
    const variant = ["home", "away"].find((v) => team.kits[v].status === "ready");
    if (!variant) {
      assert.equal(team.avatar, undefined, `${team.name} has no ready kit`);
      continue;
    }
    withAvatar++;
    const kit = JSON.parse(await fs.readFile("public" + team.kits[variant].details_path, "utf8"));
    const { colors } = kit.png_layout?.config ?? kit.config;
    assert.equal(team.avatar.variant, variant);
    assert.equal(team.avatar.body, colors.body.toUpperCase());
    assert.ok([colors.leftSleeve, colors.collar, colors.body].map((c) => c.toUpperCase()).includes(team.avatar.ring));
  }
  assert.ok(withAvatar > 0);
});
