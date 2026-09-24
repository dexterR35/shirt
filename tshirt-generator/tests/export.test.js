import test from "node:test";
import assert from "node:assert/strict";
import { EXPORT_SIZES, EXPORT_RATIOS, EXPORT_FORMATS, exportDimensions, exportFilename, zipFilename } from "../src/lib/export.js";

test("download sizes are the longest side; every shape keeps the shirt square inside", () => {
  assert.deepEqual(EXPORT_SIZES, [128, 168, 256, 512, 1024, 2048, 4096]);
  assert.deepEqual(exportDimensions(512, "1:1"), { width: 512, height: 512 });
  assert.deepEqual(exportDimensions(1280, "4:5"), { width: 1024, height: 1280 });
  assert.deepEqual(exportDimensions(2048, "16:9"), { width: 2048, height: 1152 });
  assert.deepEqual(exportDimensions(256, "9:16"), { width: 144, height: 256 });
  assert.throws(() => exportDimensions(512, "3:2"), /shapes/);
  // The square shirt render (the shorter side) stays within what the renderer accepts.
  for (const size of EXPORT_SIZES)
    for (const ratio of Object.keys(EXPORT_RATIOS)) {
      const { width, height } = exportDimensions(size, ratio);
      assert.ok(Math.min(width, height) >= 64 && Math.max(width, height) === size);
    }
});

test("PNG, WebP and AVIF are offered, each with its own file type", () => {
  assert.deepEqual(Object.keys(EXPORT_FORMATS), ["png", "webp", "avif"]);
  assert.equal(EXPORT_FORMATS.avif.type, "image/avif");
  const item = { country_name: "England", team_name: "Arsenal", team_id: "team_1", kit_season: "2026/27", variant: "home", revision: "r001" };
  assert.match(exportFilename(item, 1024, "avif", false, "4:5"), /-home-r001-819x1024px\.avif$/);
});

test("file names carry the exact pixel size, format and shape", () => {
  const item = { country_name: "England", team_name: "Arsenal", team_id: "team_1", kit_season: "2026/27", variant: "home", revision: "r001" };
  assert.match(exportFilename(item, 512, "png"), /-home-r001-512px\.png$/);
  assert.match(exportFilename(item, 2048, "webp", true, "9:16"), /-home-r001-1152x2048px-custom\.webp$/);
  assert.equal(zipFilename(3, 256, "png", "16:9"), "tshirt-kits-3-256x144px-png.zip");
  assert.equal(zipFilename(2, 512, "webp"), "tshirt-kits-2-512px-webp.zip");
});
