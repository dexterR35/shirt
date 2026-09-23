# T-shirt Generator

A local React 19.3 + Vite 8.3 JavaScript studio for the supplied 735-team catalog. Current previews combine the original high-resolution PNG with editable team colors and patterns. Download formats and sizes are deferred. The visual kit catalog is **not complete**: 225 ready PNG adaptations, 50 drafts and 1,195 slots still in research. Football Kit Archive is the user-designated source of truth; 211 adaptations use its references.

The new workbook's **138 mandatory teams** are prioritized without removing any other teams. They have 276 Home/Away slots, **207 ready layouts** and **249 exact 2026/27 references**. The user's strict season requirement excludes calendar-year 2026 substitutions. See [mandatory coverage and remaining work](docs/MANDATORY_TEAMS_2026-27.md).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Node 20.19+ or 22.12+ is required by the installed Vite version; development was verified with Node 26.5.0. The project lives in this `tshirt-generator` directory, one level below the workspace folder.

Select a country and team, select Home or Away, then Apply. Candidate changes leave the current preview and equipment details intact. The initial preview is the neutral original master. The initial candidate is the first available Home kit in source order (currently Arsenal). Mandatory teams appear first, then readiness and workbook order; all 735 source teams remain searchable.

The PNG, colors and equipment facts are local; no AI API, live archive request or cloud account is needed at display time. `data/teams/<canonical-team-id>.json` stores Home/Away facts with independent season, design, colors, brand, sponsor, competitions, release date and provenance. Missing facts remain null. Catalog builds materialize those local files for the app. The right panel displays the applied kit's facts, replacing the original-master promotional text. Fonts are self-hosted. Each collection holds up to ten revisions; Home and Away are separate items. Custom edits are session-only; saved facts retain their original colors and are labeled accordingly. Export controls remain deferred.

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
npm run catalog:build      # Prepare PNG, catalog, evidence and archived SVG stock
npm test                   # Renderer, transparency, search, selection and validation tests
npm run test:e2e            # PNG preview, custom colors, selection and recovery
npm run build
npm run preview
```

On a fresh machine, run `npx playwright install chromium` before browser tests. The original `data:prepare` and `starter:generate` commands remain available. Imported data is separate from research progress. The legacy starter examples remain generic and are never assigned to a team.

## Research and revisions

[STATUS](docs/STATUS.md) records actual coverage. Every Home/Away slot now has a separate checkpoint in `data/research/results`, including its original seed references, link-check records, search query and discovery-batch path. The 368 search batches preserve responses for 1,470 separately named variant queries. These are discovery leads, not verified kits.

Continue from the [Football Kit Archive worklist and workflow](docs/FOOTBALL_KIT_ARCHIVE.md), with `data/research/priority-worklist.json` placing all mandatory slots first. Archive-specific searches cover all 735 teams; 317 front references are saved, including 24 calendar-year Finnish observations retained only as context. Record source URLs, exact season/variant, color estimates and visual comparison before marking an adaptation ready. Saved `data/kits` revisions are immutable. Fourteen current ready kits retain their earlier official artwork references; Brentford Home now also has an archive-backed 2026/27 revision while its official 2026–2028 revision remains unchanged.

The supplied workbook contains clubs and reserve teams grouped by country/association. It does not contain a separate national-team kit inventory. Source competition metadata remains archived outside the product filters.
