import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import sharp from "sharp";
import {
  renderShirt,
  neutralConfig,
  validateConfig,
  validatePath,
} from "../src/lib/shirt-renderer.js";
import {
  SOURCE_LIGHTING,
  SOURCE_SUPPORT,
} from "../src/lib/generated/base-surface.js";

test("original lighting alpha is reproduced exactly at native resolution without an embedded bitmap", async () => {
  const input = await sharp("references/reference-highlight.png")
    .ensureAlpha()
    .raw()
    .toBuffer();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><g shape-rendering="crispEdges" fill="#fff">${SOURCE_LIGHTING.map((p) => `<path d="${p.d}" opacity="${p.alpha / 255}"/>`).join("")}</g></svg>`;
  assert.doesNotMatch(svg, /<image|data:image/);
  const output = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer();
  for (let i = 3; i < input.length; i += 4)
    assert.equal(output[i], input[i], `alpha at pixel ${(i - 3) / 4}`);
});
test("all kit layouts retain the same transparency, dimensions and original geometry transform", async () => {
  let mask;
  const variants = [
    neutralConfig(),
    ...(await Promise.all(
      (await fs.readdir("data/kits"))
        .filter((f) => f.endsWith(".json"))
        .map(
          async (f) =>
            JSON.parse(await fs.readFile("data/kits/" + f, "utf8")).config,
        ),
    )),
  ];
  for (const config of variants) {
    const svg = renderShirt(config);
    assert.equal(svg.match(/translate\(32 32\) scale\(2.24\)/g).length, 1);
    assert.doesNotMatch(
      svg,
      /<(?:image|script|foreignObject|text)\b|(?:href|src)=/i,
    );
    const { data, info } = await sharp(Buffer.from(svg))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    assert.equal(info.width, 512);
    assert.equal(info.height, 512);
    assert.equal(data[3], 0);
    const alpha = Buffer.from(
      Array.from({ length: 512 * 512 }, (_, i) => data[i * 4 + 3]),
    );
    if (mask)
      assert.equal(
        alpha.equals(mask),
        true,
        "Every revision must have the same alpha mask",
      );
    else mask = alpha;
  }
});
test("custom artwork cannot paint outside the source support", async () => {
  const config = neutralConfig();
  config.layers = [
    {
      type: "rect",
      clip: "all",
      x: -100,
      y: -100,
      width: 400,
      height: 400,
      fill: "#FF0000",
    },
  ];
  const output = await sharp(Buffer.from(renderShirt(config)))
    .ensureAlpha()
    .raw()
    .toBuffer();
  assert.equal(output[3], 0);
  assert.ok(SOURCE_SUPPORT.length > 100);
});
test("hostile markup, unknown clips, invalid paths, NaN and external fills are rejected", () => {
  for (const change of [
    (c) => (c.colors.body = "url(https://example.com/a)"),
    (c) => (c.colors.body = '#ffffff" onload="alert(1)'),
    (c) => c.layers.push({ type: "image", clip: "all", fill: "#FFFFFF" }),
    (c) =>
      c.layers.push({
        type: "rect",
        clip: "outside",
        fill: "#FFFFFF",
        x: 0,
        y: 0,
        width: 10,
        height: 10,
      }),
    (c) =>
      c.layers.push({
        type: "path",
        clip: "all",
        fill: "#FFFFFF",
        d: "M0 0<script/>",
      }),
    (c) =>
      c.layers.push({
        type: "rect",
        clip: "all",
        fill: "#FFFFFF",
        x: NaN,
        y: 0,
        width: 10,
        height: 10,
      }),
    (c) => (c.rawMarkup = "<script/>"),
  ]) {
    const c = neutralConfig();
    change(c);
    assert.throws(() => validateConfig(c));
  }
  for (const d of [
    "M0",
    "M0 0L1",
    "M0 0A-1 2 0 1 0 4 5",
    "M0 0A1 2 0 3 0 4 5",
    "M0 0Z2",
    "M0 0L999999 2",
  ])
    assert.throws(() => validatePath(d));
  assert.equal(
    validatePath("M0 0C1 2 3 4 5 6Q7 8 9 10Z"),
    "M0 0C1 2 3 4 5 6Q7 8 9 10Z",
  );
});
test("untrusted display text is XML escaped", () => {
  const svg = renderShirt(neutralConfig(), '<script>alert("x")</script>');
  assert.ok(svg.includes("&lt;script&gt;"));
  assert.doesNotMatch(svg, /<script>/);
});

test('display surface uses smooth curves and interpolated light at large export sizes', async () => {
  const {GEOMETRY}=await import('../starter/shirt-svg/shirt-engine-reference.mjs');
  const svg=renderShirt({...neutralConfig(),templateVersion:'reference-front-2'}, 'Historical master', 'original-png-smooth-2');
  assert.doesNotMatch(svg,/crispEdges/);
  assert.match(svg,/original-light-interpolation/);
  const reference=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path transform="${GEOMETRY.canvasTransform}" d="${GEOMETRY.outline}" fill="#FFFFFF"/></svg>`;
  const actual=await sharp(Buffer.from(svg),{density:144}).ensureAlpha().raw().toBuffer();
  const expected=await sharp(Buffer.from(reference),{density:144}).ensureAlpha().raw().toBuffer();
  let differences=0;for(let i=3;i<actual.length;i+=4)if(actual[i]!==expected[i])differences++;
  assert.equal(differences,0,'Export alpha follows the continuous Bezier silhouette at 1024 pixels');
});
test('every historical kit SVG remains byte-identical after replacement of the default base',async()=>{
  const {assetFilename}=await import('../src/lib/catalog.js');
  for(const file of (await fs.readdir('data/kits')).filter(f=>f.endsWith('.json'))){
    const revision=JSON.parse(await fs.readFile('data/kits/'+file,'utf8'));
    const title=`${revision.team_name} · ${revision.kit_season} · ${revision.variant}`;
    assert.equal(renderShirt(revision.config,title,revision.surface_version ?? 'original-png-vector-1'),await fs.readFile('public/assets/shirts/'+assetFilename(revision),'utf8'));
  }
});
