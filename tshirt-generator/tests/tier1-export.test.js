import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { unzipSync } from "fflate";
import { tier1Filename, tier1Items, renderTier1Zip } from "../src/lib/tier1-export.js";

const manifest = JSON.parse(readFileSync(new URL("../public/catalog/manifest.json", import.meta.url)));
const items = tier1Items(manifest.teams);

test("Tier 1 exports both variants of every mandatory team with unique portable names", () => {
  assert.equal(items.length, 276);
  assert.equal(new Set(items.map((item) => item.team_id)).size, 138);
  assert.equal(new Set(items.map(tier1Filename)).size, items.length);
  for (const team of manifest.teams) {
    const variants = items.filter((item) => item.team_id === team.id).map((item) => item.variant);
    assert.deepEqual(variants, team.mandatory ? ["home", "away"] : []);
  }
  assert.equal(tier1Filename({ team_name: "Manchester United", variant: "away" }), "manchester_united_away.png");
  assert.equal(tier1Filename({ team_name: "../Știința / Test", variant: "home" }), "stiinta_test_home.png");
  const team = manifest.teams.find((team) => team.mandatory);
  assert.throws(() => tier1Items([]), /No Tier 1/);
  assert.throws(() => tier1Items([team, { ...team, id: "other" }]), /Duplicate export name/);
  assert.throws(() => tier1Items([{ ...team, kits: { ...team.kits, away: { status: "draft" } } }]), /away is not ready/);
});

test("Tier 1 ZIP retains all entries and PNG bytes, using the selected size and shape", async () => {
  let completed = 0;
  const blob = await renderTier1Zip(items, {
    size: 256, ratio: "9:16", lighting: 150,
    load: async (item) => ({ config: { name: tier1Filename(item) } }),
    render: async (config, size, format, ratio, lighting) => {
      assert.deepEqual([size, format, ratio, lighting], [256, "png", "9:16", 150]);
      completed++;
      return new Blob([config.name]);
    },
    onProgress: (index, total) => {
      assert.equal(index, completed); // sequential, never hold every render at once
      assert.equal(total, 276);
    },
  });
  const files = unzipSync(new Uint8Array(await blob.arrayBuffer()));
  assert.deepEqual(Object.keys(files), items.map(tier1Filename));
  for (const [name, bytes] of Object.entries(files)) assert.equal(new TextDecoder().decode(bytes), name);
});

test("a cancelled or failed Tier 1 export stops before later kits and returns no partial ZIP", async () => {
  const abort = new AbortController();
  let loads = 0;
  await assert.rejects(renderTier1Zip(items, {
    size: 168, signal: abort.signal,
    load: async () => { loads++; return { config: {} }; },
    render: async () => { abort.abort(); return new Blob(["png"]); },
  }), { name: "AbortError" });
  assert.equal(loads, 1);
  loads = 0;
  await assert.rejects(renderTier1Zip(items, {
    size: 168,
    load: async () => { if (++loads === 2) throw Error("Missing local JSON"); return { config: {} }; },
    render: async () => new Blob(["png"]),
  }), /Arsenal away: Missing local JSON.*No ZIP was downloaded/);
  assert.equal(loads, 2);
  await assert.rejects(renderTier1Zip(items, { size: 167 }), /offered download sizes/);
  await assert.rejects(renderTier1Zip([items[0], items[0]], { size: 168 }), /Duplicate export names/);
});
