/**
 * Prototype step 4: comparison sheets for one kit.
 *   front: today's flat PNG composite | today's three.js | Blender passes
 *   other views: today's three.js | Blender passes
 * node prototypes/blender-passes/compare.mjs "<team>" <home|away> <compare dir>
 */
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { kitPreviewConfig } from '../../src/lib/png-layout.js';
import { PNG_PREVIEW, renderColorArtwork } from '../../src/lib/png-shirt.js';
import { compositePixels, paintArea } from '../../src/lib/composite.js';

const [team, variant, dir] = process.argv.slice(2);
const slug = `${team.toLowerCase().replace(/\W+/g, '-')}-${variant}`;
const catalog = JSON.parse(await fs.readFile('public/catalog/manifest.json', 'utf8'));
const entry = catalog.teams.find((t) => t.name === team);
const item = { ...entry.kits[variant], team_id: entry.id, variant };
const config = kitPreviewConfig(JSON.parse(await fs.readFile('public' + item.details_path, 'utf8')), item);

// Today's flat preview, the app's maths: base.png copy × kit paint, same framing (7/8).
const size = 1536, { margin, span } = paintArea(size), inner = Math.round(span), pad = Math.round(margin);
const square = (input) => input.resize(inner, inner).extend({ top: pad, bottom: size - inner - pad, left: pad, right: size - inner - pad, background: { r: 0, g: 0, b: 0, alpha: 0 } }).ensureAlpha().raw().toBuffer();
const base = await square(sharp('public' + PNG_PREVIEW.path).extract({ left: Math.round(PNG_PREVIEW.x), top: Math.round(PNG_PREVIEW.y), width: Math.round(PNG_PREVIEW.span), height: Math.round(PNG_PREVIEW.span) }));
const paint = await square(sharp(Buffer.from(renderColorArtwork(config)), { density: (72 * inner) / 200 }));
// Outside the paint square the paint buffer is transparent black; white keeps the photo there.
for (let i = 0; i < paint.length; i += 4) if (paint[i + 3] === 0) paint.fill(255, i, i + 4);
await sharp(Buffer.from(compositePixels(base, paint)), { raw: { width: size, height: size, channels: 4 } }).png().toFile(`${dir}/${slug}-front-flat-png.png`);

const TILE = 640, LABEL = 56, background = { r: 17, g: 26, b: 42, alpha: 1 };
const label = (text, width) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${LABEL}"><text x="${width / 2}" y="36" font-family="DejaVu Sans, sans-serif" font-size="24" fill="#e8edf5" text-anchor="middle">${text}</text></svg>`);
async function sheet(name, rows) {
  const columns = rows[0].length, width = columns * TILE, height = rows.length * (TILE + LABEL);
  const parts = [];
  for (const [r, row] of rows.entries()) for (const [c, [file, text]] of row.entries()) {
    parts.push({ input: await sharp(`${dir}/${file}`).resize(TILE, TILE).png().toBuffer(), left: c * TILE, top: r * (TILE + LABEL) + LABEL });
    parts.push({ input: label(text, TILE), left: c * TILE, top: r * (TILE + LABEL) });
  }
  await sharp({ create: { width, height, channels: 4, background } }).composite(parts).png().toFile(`${dir}/${name}`);
  console.log(`${dir}/${name}`);
}
await sheet(`${slug}-front-compare.png`, [[
  [`${slug}-front-flat-png.png`, 'Today: flat PNG (base.png)'],
  [`${slug}-front-threejs.png`, 'Today: 3D view (three.js)'],
  [`${slug}-front-blender.png`, 'Blender passes (Cycles)'],
]]);
await sheet(`${slug}-angles-compare.png`, ['quarter', 'side', 'back'].map((view) => [
  [`${slug}-${view}-threejs.png`, `three.js · ${view === 'quarter' ? '¾ right' : view}`],
  [`${slug}-${view}-blender.png`, `Blender passes · ${view === 'quarter' ? '¾ right' : view}`],
]));
