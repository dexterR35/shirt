# Project status

24 September 2026. Global coverage is **551 ready / 1,470 slots**. Tier 3 has started with **16 ready / 766 slots**. Tier 1 is complete: all 138 mandatory teams have Home and Away available. Tier 2 has **254 ready / 300 slots** across the preserved 150 second-tier teams; all 46 remaining slots have documented current-source gaps. The wider catalog remains unfinished. The pulled Studio, Catalog, routing and export changes are preserved.

## Tier 3 continuation — 24 September 2026

Sixteen new 2026/27 Home/Away shirts are ready for AFC Wimbledon, Barnsley, Blackpool, Bradford City, Bromley, Burton Albion, Cambridge United and Doncaster Rovers. Each has independent source evidence, equipment facts, reviewed PNG paint and source/render comparisons. The Tier 3 worklist preserves all 383 workbook identities and 766 slots, with 750 still researching. See [the batch report and next teams](TIER3_CONTINUATION_2026-09-24.md).

Current global totals: **551 ready, 0 drafts, 873 researching, 46 blocked**, **554 saved archive fronts** and **537 archive-reviewed adaptations**. Prior ready hashes, original PNG bytes, Tier 1 seasons and Tier 2 source-gap records remain intact.

## Tier 2 continuation — 24 September 2026

The user requested finished painted shirts before continuing. This pass adds **138 ready kits**: 30 corrected drafts, 14 previously unpainted Italian references, Afumați Home, 36 French variants, 44 Spanish variants, 12 Greek variants and FC Haka Home. Tier 2 now has **254 ready, 0 drafts, 0 researching and 46 blocked slots**. All 254 saved Tier 2 references have reviewed paint. England (48), Spain (44), Germany (36), Italy (40), and France (36) have both variants complete. The 46 source gaps are Romanian (7), Greek (20) and Finnish (19); each remaining team history was checked. Literal source seasons remain 2026/27 except FC Haka Home 2026.

The original 30 draft revisions and all prior ready revisions are retained. New paint has individual source/render comparisons, configuration hashes, and explicit limitations for hidden regions, simplified fine print, and the original round neckline. See [the paint continuation](TIER2_PAINT_2026-09-24.md), the [earlier checkpoint](TIER2_CONTINUATION_2026-09-24.md), and `data/research/tier2-worklist.json`.

## Mandatory workbook and equipment information

All 138 rows in `teams_tier-1_by-tier (2).xlsx` map uniquely to existing canonical IDs across eight countries. The copied source workbook and SHA-256 audit are preserved separately; its color names/HEX values remain unverified context. All 735 teams stay available; mandatory teams lead app ordering and the resumable research worklist. The Catalog tab now lists competitions (grouped by country and UEFA) in a sortable, searchable table of shirts with multi-select into the collection; the Studio still navigates by country and team.

Latest user direction: use independently evidenced 2026 kits when 2026/27 is unconfirmed and finish all Tier 1. Mandatory coverage is **276 ready / 276 slots**, with no unfinished mandatory slots: **251 from 2026/27, 24 Finnish calendar-year 2026 variants, and Petrolul Away labeled 2025/26** as an explicit fallback for 2026. Real Sociedad references are verified through the season listing because the individual pages return 404. Source labels are never rewritten. The per-slot fallback policy and source limitations are saved locally.

`data/teams/<team_id>.json` now stores local Home/Away equipment facts for every canonical team. Each verified source entry includes season, design, color names, brand, sponsor, competitions, release date, source URL and checked date. Unresearched/missing values are null. The app's right panel replaces the original-master promotional text with applied-kit details. Data travels with the local applied revision, so candidate changes, failed loads and custom colors cannot silently change the facts. No live archive call occurs in the app. See [mandatory coverage](MANDATORY_TEAMS_2026-27.md).

Global coverage at the preceding Tier 2 checkpoint was **535 ready**, **0 drafts**, **889 researching**, **46 blocked**, **538 saved archive references** and **521 archive-reviewed adaptations**. Tier 1 remains **276/276 ready**, with its original season split unchanged. See [Tier 1 completion](TIER1_COMPLETION_2026-09-24.md) for its last 43 revisions and source limitations. Original PNG bytes, earlier reviewed revisions and local equipment facts are retained. Fine graphics and hidden source regions are documented adaptations to the common base. Earlier batch reports remain historical checkpoints.

## Application

Lighting control (24 September): Studio and Collection share a 50–200% fabric-lighting slider, with 100% reproducing the original rendering and a Reset lighting button. It updates the Studio preview, live front thumbnail and catalog pictures, is remembered locally after refresh, and is baked into individual PNG/WebP/AVIF downloads, collection ZIPs and the entire Tier 1 PNG ZIP. The chosen percentage appears in the download confirmation and controls are locked during export. Lighting adjusts source fabric tones before applying kit paint, preserving alpha and avoiding clipped team-color highlights; base files and saved kit configurations remain unchanged.

Lighting validation: 12 targeted unit/data/render tests and five browser checks passed, including all 276 Tier 1 PNGs at 168 × 168 with 200% lighting, individual and collection ZIP output, reset, persistence, mobile layout and existing export formats. At equal resolution, preview/download opaque RGB and every alpha value match exactly; browser PNG encoders differ by at most one RGB level at translucent edges. The production build passed with 233 modules.

Tier 1 bulk download: open Collection, choose a size and image shape, then “Download all Tier 1 · PNG ZIP”. This exports all 138 mandatory teams / 276 Home and Away variants from saved catalog colors, independent of filters and the ten-kit collection. PNG filenames use `team_home.png` / `team_away.png` (for example `manchester_united_home.png`); the ZIP name records the pixel dimensions. The existing yes/no dialog confirms the count and dimensions. Sequential rendering, progress and cancellation support larger exports; missing kits, duplicate filenames or failed renders stop the export without downloading a partial archive.

Bulk export validation (24 September): Edge downloaded and unpacked all 276 real PNGs at exactly 168 × 168, with the expected unique Home/Away filenames. Browser checks also cover cancellation, request failures and a 390 px viewport; unit checks cover full-catalog membership, archive bytes, size/shape forwarding and duplicate/missing-kit rejection. Production build passed with 232 modules.

Vercel routing correction (24 September): `/catalog/` and nested competition pages now share the SPA fallback with `/studio`; catalog JSON and static asset requests remain excluded. The previous rule excluded the entire `/catalog/` prefix, causing direct navigation and refresh to return Vercel 404. The correction takes effect when a deployment containing the updated `vercel.json` is published.

React 19.3.0, React DOM 19.3.0, Vite 8.3.0, JavaScript/JSX and CSS, with a locked dependency tree. Dark navy responsive UI, country filter, accent-insensitive team search, instant team/Home/Away display without an Apply step (missing variants show the plain base and a "not available yet" message; renders cached in memory; `/studio` restores the last kit after a refresh, and each catalog tab has its own URL), one central PNG-based shirt, three preview backgrounds, ten-revision collection, previous/next and removal. Home/Away occupy separate collection slots. Missing configurations fail recoverably. Research coverage is available in the Catalog tab. The collection supports individual downloads, Download all and ZIP, with PNG/WebP/AVIF and selectable image shape. Export sizes include 168 px; choosing 1:1 produces exactly 168 × 168 px.

All 735 original identities, 39 countries/associations, 708 first teams, 27 reserve teams, 779 memberships, 16 workbook tabs, notes, links and hidden rows are preserved. Country names represent the supplied club catalog, not a newly researched set of national teams. No database, AI account or cloud service is required. The user's original base PNG loads once; kit configurations load on demand. Team reference photos and workbook audits are not shipped in the browser catalog. Font assets are local.

The shared renderer supports validated rectangles, polygons, cubic/quadratic/arc paths, linear color gradients, body/sleeve/all clipping, independent sleeve/cuff colors, custom collar geometry and detail layers. Source markup cannot be inserted. Ready revisions cannot be overwritten: `data/kit-config-lock.json` stores each ready configuration hash and the build and tests reject changes.

The generated per-kit SVG archive (`public/assets/shirts/`, 356 files, 317 MB) was removed at the user's request on 23 September 2026. The app never displayed it, it predated the PNG layout corrections, and it would otherwise have been deployed. Catalog entries no longer carry `svg_path` or an SVG hash. The files remain in git history; the vector renderer can still reproduce any revision from `data/kits`.

## Current replacement base - 23 September 2026

Display loading (24 September 2026): the screen loads a lossless **2048 × 2048 WebP** crop of the shirt square (1.56 MB) instead of the 6.8 MB master. It is generated deterministically at build time, preloaded from `index.html`, decoded asynchronously, and cached as immutable on Vercel (`vercel.json`) together with the content-named 8K master, which the preview never downloads. A test verifies the copy's outline matches the master within 2 pixels.

The current preview uses the **original high-resolution PNG**, not the softened vector reconstruction. `original-png-composite-1` keeps the 8000 × 5000 file byte-identical, overlays validated editable color/pattern geometry, multiplies source RGB by paint RGB, and retains original alpha. The original folds, stitching, round collar and texture remain. See [BASE_ANALYSIS](BASE_ANALYSIS.md).

All 15 previously ready color configurations now have separate, individually inspected PNG shoulder/collar/cuff adaptations under `data/kits/png-layouts`, revision p001. The Leeds correction uses the user's flat-front reference: two broad blue shoulder tapes, yellow collar/cuff edging and revised body pinline spacing. Other available kits were compared with their saved official photographs. The renderer now paints cuff details above cuff base colors and supports validated PNG-specific collar layers. Catalog Apply resolves the exact reviewed layout revision; historical source configurations and SVG bytes remain unchanged. This trim review does not certify exact body fabric patterns or reproduce different physical collar construction. No new kit-season research or human approval is claimed.

A collapsible color studio edits body, sleeves, collar and cuffs as a custom session preview. `npm run base:prepare` copies the original PNG, and catalog builds include that step. Original/blue/Barcelona examples are under `artifacts/png-base`; before/after grids, the Leeds comparison and browser proof are under `artifacts/layout-correction`. `scripts/correct-png-layouts.mjs --reviewed` reproduces the current layouts and refuses to overwrite changed reviewed files; subsequent corrections require a new layout revision.

### Follow-up collar correction

The user identified a duplicated collar in Ipswich Away: p001 painted a V over the PNG's existing round collar. This was an implementation error, not an unavoidable base limitation. All eight V/polo adaptations now have separate reviewed p002 revisions; the other seven retain p001. New collar color bands follow only the sewn round ring, with no V, flaps or placket. Renderer clipping also prevents any custom collar layer extending onto the chest. Original source PNG, shoulder/body/cuff artwork and historical revisions remain intact. `scripts/correct-png-collars.mjs --reviewed` reproduces the eight revisions; `scripts/review-png-collars.mjs` produces closeups and the Ipswich before/after under `artifacts/collar-correction`. The reference kits' different collar construction is deliberately not reproduced on this common base.

## Research coverage

### Earlier Football Kit Archive continuation checkpoint

The user designated Football Kit Archive as the source of truth for new research. All 735 canonical workbook teams have archive-specific search checkpoints in 184 batches. Exact-name discovery finds candidates for 317 teams; these remain leads. There are now **264 independently saved archive references** for 134 workbook teams, with source metadata and image hashes.

The latest continuation adds **138 ready variants**, bringing the app to **165 ready variants**, **30 drafts** and **1,275 researching slots**. Of the requested 1,443 unfinished variants, **1,305 remain unfinished**. See [the batch inventory and concrete remaining gaps](CATALOG_CONTINUATION_2026-09-23.md). All 166 new drawings were compared with their source images; 28 remain drafts. The high-resolution PNG and its physical round collar are unchanged.

The importer, HTTP scraper, ordinary-browser fallback and checkpoints are documented in [FOOTBALL_KIT_ARCHIVE](FOOTBALL_KIT_ARCHIVE.md). Direct HTTP returns 403 browser verification; the scraper stops and records that result. Normal browser access supplied the collected pages. There are 1,206 archive reference slots still to acquire. No generic preset or metadata-only scrape is promoted automatically.

| Work | Actual count |
| --- | ---: |
| Teams in the app | 735 / 735 |
| Separately queried Home/Away slots | 1,470 / 1,470 |
| Saved discovery batches | 368 |
| Per-slot resumable result records | 1,470 |
| Distinct workbook URLs checked | 297 / 297 |
| Source URL HTTP 200 responses | 293 |
| Source URL failures | 4 |
| Previously source-reviewed layouts available for PNG adaptation | 15 |
| Current ready PNG adaptations | 165 |
| Football Kit Archive teams searched | 735 / 735 |
| Archive detail pages / saved front references | 264 / 264 |
| Archive-reviewed PNG adaptations | 150 |
| Draft artwork needing refinement | 30 |
| Slots still in research | 1,275 |
| Slots with final missing-evidence/blocked determination | 0 |

The fifteen previously source-reviewed variants are Barcelona Home/Away, Ipswich Town Home/Away, Brentford Home/Away, Newcastle United Home/Away, Manchester United Home/Away, Liverpool Home/Away, Arsenal Home, Aston Villa Home and Leeds United Home. The twelve additions across the two continuation batches were compared against separately saved official club/manufacturer front photographs on 23 September. Brentford Home retains the official 2026–2028 design label; the other current designs are 2026/27. Each has official source URLs, a saved front photograph, estimated-color evidence, native vector configuration and a Codex visual review on the historical shirt. Separate PNG trim reviews are saved with explicit scope and limitations. No human approval is claimed.

Ipswich Town Home now uses r003: nested fan/diamond spacing was refined and unsupported white side panels removed. Previous revisions remain unchanged. Nottingham Forest Away is a draft: green/red collar and cuffs are established, but irregular fern-field placement still needs closer tracing. Forest Home has a saved official flat-front photograph; its irregular red marbling is not yet traced. Liverpool Home now uses the complete official short-sleeve flat front, with individually recorded line endpoints and triangle vertices. Aston Villa Away is a second draft: its collar/cuffs are established, but the linked gaslamp fabric texture is not yet accurately reproduced. Arsenal Away and Leeds Away have saved official model photographs and resumable next steps. Every remaining slot retains its query, search response and seed provenance.

The source-specific drawing script is `scripts/research/england-2026-09-23.mjs`; it preserves ready revisions. The second drawing script is `scripts/research/england-second-2026-09-23.mjs`. Review images and comparison grids are under `artifacts/continuation-2026-09-23` and `artifacts/continuation-2026-09-23-b`. New first revisions explicitly use `original-png-smooth-2`; they are not legacy pixel-boundary r001 assets.

All 1,470 original variant queries and 735 archive-specific team queries were submitted, but discovery responses have **not** all been visually verified. Search completion must not be reported as kit completion. Remaining research slots are not falsely marked blocked. Continue archive identity checks, front-image acquisition, graphic tracing and comparison for the remaining 1,305 non-ready slots.

Four seed URL checks failed: the Ligue 1 and Ligue 2 calendar articles returned 500; the RFEF Primera Federación groups article returned 403; the Veikkausliiga team-statistics page failed to fetch. These are provenance-link failures, not proof that associated kit references are unavailable. Full URLs and outcomes are saved in `data/research/link-checks`.

## Validation

`data:verify`, 29 Node tests, twelve Playwright browser tests and the production build pass for the current changes. Browser tests used installed Microsoft Edge (`PLAYWRIGHT_CHANNEL=msedge`). Checks cover all 735 local team JSON files, 138 priority identities, 276 mandatory slots, strict seasons, source links, Apply/collection synchronization, no external display requests, all 183 ready layout bindings, the original PNG and unchanged historical SVG bytes. The drawing pipeline rejects mandatory source-season mismatches before writing artwork. Existing color, collar, collection and recovery checks also pass. See [VALIDATION](VALIDATION.md).

The app is functional. The complete 1,470-kit visual stock is not finished. No background research service or scheduled continuation has been created.
