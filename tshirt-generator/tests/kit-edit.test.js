import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { editableParts, applyEdits, partIdConfig, matchPartId, visibleParts } from "../src/lib/kit-edit.js";
import { validateConfig } from "../src/lib/shirt-renderer.js";

const arsenal = JSON.parse(await fs.readFile("public/catalog/kits/team_6c3ac1a8babfe2f2338b-home-r001.json", "utf8")).png_layout.config;

test("editable parts are the six named parts plus each distinct stripe/detail color", () => {
  const parts = editableParts(arsenal);
  assert.deepEqual(parts.slice(0, 6).map((p) => p.label), ["Body", "Left sleeve", "Right sleeve", "Collar", "Left cuff", "Right cuff"]);
  const details = parts.slice(6);
  assert.ok(details.length >= 1);
  assert.equal(new Set(details.map((p) => p.color)).size, details.length);
  assert.ok(details.every((p) => p.id === `fill:${p.color}`));
});

test("edits recolor exactly the chosen parts and leave the saved kit untouched", () => {
  const before = JSON.stringify(arsenal);
  const detail = editableParts(arsenal)[6];
  const edited = applyEdits(arsenal, { "role:body": "#00FF00", [detail.id]: "#123456" });
  assert.equal(JSON.stringify(arsenal), before);
  assert.equal(edited.colors.body, "#00FF00");
  assert.equal(edited.colors.leftSleeve, arsenal.colors.leftSleeve);
  const fills = [...edited.layers, ...edited.detailLayers].filter((l) => !l.colorRole).map((l) => l.fill);
  assert.ok(fills.includes("#123456"));
  assert.ok(!fills.includes(detail.color));
  validateConfig(edited);
  assert.equal(applyEdits(arsenal, {}), arsenal);
  assert.throws(() => applyEdits(arsenal, { "role:body": "red" }), /HEX/);
});

test("every part gets its own ID color for click selection", () => {
  const { config, ids } = partIdConfig(arsenal);
  validateConfig(config);
  assert.equal(ids.length, editableParts(arsenal).length);
  assert.equal(new Set(ids.map((i) => i.rgb.join())).size, ids.length);
  for (const { id, rgb } of ids) assert.equal(matchPartId(ids, rgb), id);
  assert.equal(matchPartId(ids, [255, 255, 255]), null);
});

test("covered named parts are hidden from the editor, thin stripes never are", () => {
  const full = new Map([["role:body", 900], ["role:leftSleeve", 30], ["role:collar", 200], ["fill:#123456", 1]]);
  const named = new Map([["role:body", 1000], ["role:leftSleeve", 1500], ["role:collar", 210]]);
  const visible = visibleParts(full, named);
  assert.ok(!visible.has("role:leftSleeve"));
  assert.ok(visible.has("role:collar"));
  assert.ok(visible.has("fill:#123456"));
  assert.ok(visibleParts(new Map(), new Map()).has("role:body"));
});
