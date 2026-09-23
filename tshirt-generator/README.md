# T-shirt Generator

A local React 19.3 + Vite 8.3 JavaScript studio for the supplied 735-team catalog. Current previews combine the original high-resolution PNG with editable team colors and patterns. Download formats and sizes are deferred. The visual kit catalog is **not complete**: 15 previously source-reviewed kit layouts, 2 drafts and 1,453 slots still in research. Mapping those layouts to the PNG is labeled as adaptation, not a new approval.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Node 20.19+ or 22.12+ is required by the installed Vite version; development was verified with Node 26.5.0. The project lives in this `tshirt-generator` directory, one level below the workspace folder.

Select a country and team, select Home or Away, then Apply. Candidate changes leave the current preview intact. The initial preview is the neutral original master. The initial candidate is the first available Home kit in source order (currently Arsenal). Teams with a ready variant are placed first; all 735 source teams remain searchable.

The PNG and color configurations are local; no AI API, online research or cloud account is needed at display time. Fonts are self-hosted. Each collection holds up to ten revisions; Home and Away are separate items. Try your own colors opens body, sleeve, collar and cuff controls. The collection and custom edits are session-only; saved kit files are not changed. Export controls are deferred until sizing requirements are chosen.

## Original artwork

The current `base.png` is an **8000 × 5000** photograph with transparency, copied byte-for-byte to `public/assets/base/source.png`. Its original fabric, seams, collar, folds and alpha are retained. The app draws validated SVG color shapes, multiplies their RGB with the source RGB, and preserves source alpha. White paint reproduces the original. The PNG stays high-resolution; only the browser display is sampled to its viewport. The vector trace from the previous attempt is archived and no longer supplies preview shading.

Read [the measurement and fidelity notes](docs/BASE_ANALYSIS.md). Team colors and pattern placement are estimates from official images. The physical round collar remains part of the common PNG; adapting a V-neck or polo reference needs separate review. Native-resolution white/blue/Barcelona examples can be generated with `node scripts/review-png-base.mjs`.

## Commands

```sh
npm run data:verify         # Original workbook/catalog invariants
npm run base:prepare        # Preserve and deploy the original high-resolution PNG
npm run research:links     # Resumable checks of all 297 source URLs
npm run research:checkpoint # Materialize saved search batches into per-slot progress
npm run catalog:build      # Prepare PNG, catalog, evidence and archived SVG stock
npm test                   # Renderer, transparency, search, selection and validation tests
npm run test:e2e            # PNG preview, custom colors, selection and recovery
npm run build
npm run preview
```

On a fresh machine, run `npx playwright install chromium` before browser tests. The original `data:prepare` and `starter:generate` commands remain available. Imported data is separate from research progress. The legacy starter examples remain generic and are never assigned to a team.

## Research and revisions

[STATUS](docs/STATUS.md) records actual coverage. Every Home/Away slot now has a separate checkpoint in `data/research/results`, including its original seed references, link-check records, search query and discovery-batch path. The 368 search batches preserve responses for 1,470 separately named variant queries. These are discovery leads, not verified kits.

Continue from a slot's saved official leads, inspect the actual front photograph, save the reference, and create validated editable paint geometry. Record source URLs, season/variant, color estimates and visual review on the PNG preview before calling an adaptation approved. Saved `data/kits` revisions are immutable. Their recorded vector surface versions remain for archival reproducibility; no new PNG adaptation approvals or download sizes are implied by applying an existing configuration.

The supplied workbook contains clubs and reserve teams grouped by country/association. It does not contain a separate national-team kit inventory. Source competition metadata remains archived outside the product filters.
