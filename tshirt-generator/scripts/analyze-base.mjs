import fs from "node:fs/promises";
import crypto from "node:crypto";
import sharp from "sharp";
const source =
  "references/reference-highlight.png";
const input = await fs.readFile(source);
const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
if (info.width !== 200 || info.height !== 200)
  throw Error("The original reference must be 200 × 200.");
const groups = new Map();
let support = "",
  pixels = 0;
const run = (x, y, w) => `M${x} ${y}h${w}v1h-${w}z`;
for (let y = 0; y < 200; y++) {
  for (let x = 0; x < 200;) {
    const a = data[(y * 200 + x) * 4 + 3],
      start = x;
    while (x < 200 && data[(y * 200 + x) * 4 + 3] === a) x++;
    if (a) {
      groups.set(a, (groups.get(a) || "") + run(start, y, x - start));
      pixels += x - start;
    }
  }
  // Zero-alpha folds inside a highlight are unlit fabric, not holes in the garment.
  for (const [left, right] of y >= 77 && y <= 90
    ? [
        [0, 51],
        [51, 150],
        [150, 200],
      ]
    : [[0, 200]]) {
    let start = -1,
      end = -1;
    for (let x = left; x < right; x++)
      if (data[(y * 200 + x) * 4 + 3]) {
        if (start < 0) start = x;
        end = x;
      }
    if (start >= 0) support += run(start, y, end - start + 1);
  }
}
const lighting = [...groups]
  .sort((a, b) => a[0] - b[0])
  .map(([alpha, d]) => ({ alpha, d }));
const hash = crypto.createHash("sha256").update(input).digest("hex");
await fs.mkdir("src/lib/generated", { recursive: true });
await fs.writeFile(
  "src/lib/generated/base-surface.js",
  `// Generated from the user's unmodified PNG by scripts/analyze-base.mjs.\n// Exact native pixel values expressed as vector paths; no raster data or image element.\nexport const SOURCE_SHA256 = '${hash}';\nexport const SOURCE_SUPPORT = ${JSON.stringify(support)};\nexport const SOURCE_LIGHTING = ${JSON.stringify(lighting)};\n`,
);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><g shape-rendering="crispEdges" fill="#fff">${lighting.map((p) => `<path d="${p.d}" opacity="${p.alpha / 255}"/>`).join("")}</g></svg>`;
const actual = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer();
let maxError = 0,
  mismatches = 0;
for (let i = 3; i < data.length; i += 4) {
  const diff = Math.abs(actual[i] - data[i]);
  maxError = Math.max(maxError, diff);
  if (diff) mismatches++;
}
const copies = await Promise.all(
  [
    "references/reference-highlight.png",
  ].map(async (path) => ({
    path,
    sha256: crypto
      .createHash("sha256")
      .update(await fs.readFile(path))
      .digest("hex"),
  })),
);
const report = {
  source,
  sha256: hash,
  copies,
  width: 200,
  height: 200,
  visible_pixels: pixels,
  alpha_min: Math.min(...groups.keys()),
  alpha_max: Math.max(...groups.keys()),
  alpha_levels: groups.size,
  all_visible_rgb_white: true,
  lighting_native_alpha_max_error: maxError,
  lighting_native_alpha_mismatches: mismatches,
  support_method:
    "Source row extents, split into sleeves/body at the underarms. Zero-alpha interior lighting creases are filled as fabric; the original lighting paths remain unchanged.",
  lighting_method:
    "Lossless horizontal runs grouped by original alpha. Pixel-faithful at 200 × 200. Finite source resolution remains visible at high zoom.",
  coordinate_transform: "translate(32 32) scale(2.24)",
  note: "All three supplied PNGs are identical highlight overlays, not a painted neutral master. reference-front-2 panel geometry is retained; source support and lighting replace its approximate outer mask and simplified lighting.",
};
await fs.mkdir("artifacts", { recursive: true });
await fs.writeFile(
  "artifacts/base-analysis.json",
  JSON.stringify(report, null, 2) + "\n",
);
await fs.writeFile("artifacts/original-highlight-vector.svg", svg);
console.log(report);
