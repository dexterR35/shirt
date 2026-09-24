# T-shirt Generator

A local React 19.3 + Vite 8.3 JavaScript studio for the supplied 735-team catalog. Previews combine the original high-resolution PNG with editable team colors and patterns. The visual catalog has **551 ready shirts**, **0 drafts**, **873 researching slots** and **46 documented source gaps**. Football Kit Archive is the user-designated source of truth; 554 fronts are saved and 537 adaptations use its reviewed references.

All **138 mandatory Tier 1 teams / 276 Home and Away slots** are ready, retaining independently evidenced season labels and explicit fallbacks. Tier 2 has **254/300 ready**. The first Tier 3 batch adds **16/766 ready**; see [current status](docs/STATUS.md) and [the Tier 3 continuation](docs/TIER3_CONTINUATION_2026-09-24.md).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Node 20.19+ or 22.12+ is required by the installed Vite version; development was verified with Node 26.5.0. The project lives in this `tshirt-generator` directory, one level below the workspace folder.

## Vercel deployment

Set the Vercel project's Root Directory to `tshirt-generator`. The checked-in `vercel.json` selects Vite, `npm ci`, `npm run build` and the `dist` output directory. Publish a new deployment containing configuration changes; redeploying an older commit keeps its old rules.

Studio and Catalog URLs must reach `index.html` when opened directly or refreshed, as described in [Vercel's SPA guidance](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas). `/catalog/` also contains the app's static JSON files, so the rewrite excludes `/catalog/**/*.json`, not every `/catalog/` URL. JSON and other static assets retain normal file responses and missing-file errors. `node --test tests/vercel-routing.test.js` checks both cases.

The app opens on the plain original shirt. Choosing a team shows its Home kit immediately; the Home/Away switch changes the kit immediately. A kit that is not ready shows the plain shirt with "Home/Away kit not available yet". Rendered kits are cached in memory until reload. The Studio lives at `/studio` (a refresh reopens the last kit) and each catalog tab has its own URL (`/catalog/<group>/<competition>`). Mandatory teams appear first, then readiness and workbook order; all 735 source teams remain searchable.

The PNG, colors and equipment facts are local; no AI API, live archive request or cloud account is needed at display time. `data/teams/<canonical-team-id>.json` stores Home/Away facts with independent season, design, colors, brand, sponsor, competitions, release date and provenance. Missing facts remain null. Catalog builds materialize those local files for the app. The right panel displays the applied kit's facts, replacing the original-master promotional text. Fonts are self-hosted. Each collection holds up to ten revisions; Home and Away are separate items. Custom edits are session-only; saved facts retain their original colors and are labeled accordingly. PNG/WebP/AVIF downloads, collection ZIPs and the full Tier 1 PNG ZIP are available, with size, shape and lighting controls.

## Original artwork

The current `base.png` is an **8000 × 5000** photograph with transparency, copied byte-for-byte to `public/assets/base/source.png`. Its original fabric, seams, collar, folds and alpha are retained. The app draws validated SVG color shapes, multiplies their RGB with the source RGB, and preserves source alpha. White paint reproduces the original. The PNG stays high-resolution; only the browser display is sampled to its viewport. The vector trace from the previous attempt is archived and no longer supplies preview shading.

Read [the measurement and fidelity notes](docs/BASE_ANALYSIS.md). Team colors and pattern placement are estimates from saved source images. The physical round collar remains part of the common PNG; only its existing ring is recolored, without adding V-neck or polo geometry. Native-resolution white/blue/Barcelona examples can be generated with `node scripts/review-png-base.mjs`.

## Commands

```sh
npm run data:verify         # Original workbook/catalog invariants
npm run base:prepare        # Preserve and deploy the original high-resolution PNG
npm run research:links     # Resumable checks of all 297 source URLs
npm run research:checkpoint # Materialize saved search batches into per-slot progress
npm run research:fka:import # Import archive captures and save public front references
npm run research:fka:scrape # Collect observed kit pages; checkpoint HTTP/access failures
npm run research:fka:review # Render source/adaptation comparison sheets
npm run catalog:build      # Prepare PNG, catalog, evidence and the ready-kit config lock
npm test                   # Renderer, transparency, search, selection and validation tests
npm run test:e2e            # PNG preview, custom colors, selection and recovery
npm run build
npm run preview
```

On a fresh machine, run `npx playwright install chromium` before browser tests. The original `data:prepare` and `starter:generate` commands remain available. Imported data is separate from research progress. The legacy starter examples remain generic and are never assigned to a team.

## Research and revisions

[STATUS](docs/STATUS.md) records actual coverage. Every Home/Away slot now has a separate checkpoint in `data/research/results`, including its original seed references, link-check records, search query and discovery-batch path. The 368 search batches preserve responses for 1,470 separately named variant queries. These are discovery leads, not verified kits.

Continue from the [Football Kit Archive worklist and workflow](docs/FOOTBALL_KIT_ARCHIVE.md), with `data/research/priority-worklist.json` placing all mandatory slots first. Archive-specific searches cover all 735 teams; 554 front references are saved, with source seasons preserved literally, including 25 calendar-year 2026 observations and one disclosed 2025/26 fallback. Record source URLs, exact season/variant, color estimates and visual comparison before marking an adaptation ready. Saved `data/kits` revisions are immutable. Fourteen current ready kits retain their earlier official artwork references; Brentford Home now also has an archive-backed 2026/27 revision while its official 2026–2028 revision remains unchanged.

The supplied workbook contains clubs and reserve teams grouped by country/association. It does not contain a separate national-team kit inventory. Source competition metadata remains archived outside the product filters.
