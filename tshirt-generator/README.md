# T-shirt Generator

A local React 19.3 + Vite 8.3 JavaScript studio for the supplied 735-team catalog. The interface, renderer, exports and research checkpoints are implemented. The visual kit catalog is **not complete**: 15 source-reviewed kit revisions, 2 drafts and 1,453 slots still in research.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Node 20.19+ or 22.12+ is required by the installed Vite version; development was verified with Node 26.5.0. The project lives in this `tshirt-generator` directory, one level below the workspace folder.

Select a country and team, select Home or Away, then Apply. Candidate changes leave the current preview intact. The initial preview is the neutral original master. The initial candidate is the first available Home kit in source order (currently Arsenal). Teams with a ready variant are placed first; all 735 source teams remain searchable.

SVG and ZIP downloads use saved local revisions, with no AI API, online research or cloud account at display time. Fonts are self-hosted. Each collection holds up to ten revisions; Home and Away are separate items. The session collection resets on reload.

## Original artwork

The supplied base PNG, `shirt-master.png`, and `reference-highlight.png` have identical hashes. They are **200 × 200 translucent white highlight layers**, not an opaque painted shirt. The application retains the original alpha levels as vector paths and gently interpolates their transitions without embedding a bitmap. A smooth Bézier outline replaces the initial stepped pixel boundary. Paint is placed beneath the light layer. The original 200-unit coordinate space and `translate(32 32) scale(2.24)` placement are retained.

Read [the measurement and fidelity notes](docs/BASE_ANALYSIS.md). The source has finite 200-pixel resolution. The current display interpolates that light map and uses a scalable curved outline; the raw native map remains available for exact comparison. Kit colors and placement are estimates from official images, not official textile HEX specifications or pixel-identical photographs.

## Commands

```sh
npm run data:verify         # Original workbook/catalog invariants
npm run base:analyze        # Reproduce the vector lighting and measurement report
npm run research:links     # Resumable checks of all 297 source URLs
npm run research:checkpoint # Materialize saved search batches into per-slot progress
npm run catalog:build      # Build compact manifest, SVG stock and public evidence JSON
npm test                   # Renderer, transparency, search, selection and validation tests
npm run test:e2e            # Browser interactions and exact preview/download checks
npm run build
npm run preview
```

On a fresh machine, run `npx playwright install chromium` before browser tests. The original `data:prepare` and `starter:generate` commands remain available. Imported data is separate from research progress. The legacy starter examples remain generic and are never assigned to a team.

## Research and revisions

[STATUS](docs/STATUS.md) records actual coverage. Every Home/Away slot now has a separate checkpoint in `data/research/results`, including its original seed references, link-check records, search query and discovery-batch path. The 368 search batches preserve responses for 1,470 separately named variant queries. These are discovery leads, not verified kits.

Continue from a slot's saved official leads, inspect the actual front photograph, save the reference, and create a validated JSON revision in `data/kits`. Set `surface_version` to `original-png-smooth-2` on new revisions. A missing surface version means the legacy r001 rendering for reproducibility. Record source URLs, season/variant, color estimates and visual review. Only source-reviewed revisions are downloadable. Ready revisions are immutable; a changed renderer or configuration must produce a new revision rather than overwrite an approved SVG.

The supplied workbook contains clubs and reserve teams grouped by country/association. It does not contain a separate national-team kit inventory. Source competition metadata remains archived outside the product filters.
