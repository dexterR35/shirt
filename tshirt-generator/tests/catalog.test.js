import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import {
  filterTeams,
  addToSelection,
  revisionKey,
  assetFilename,
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
