# Project status

23 September 2026. Application implemented; full visual kit stock remains incomplete. Latest update: mandatory workbook teams and local equipment JSON.

## Mandatory workbook and equipment information

All 138 rows in `teams_tier-1_by-tier (2).xlsx` map uniquely to existing canonical IDs across eight countries. The copied source workbook and SHA-256 audit are preserved separately; its color names/HEX values remain unverified context. All 735 teams stay available; mandatory teams lead app ordering and the resumable research worklist. No competition filter was added.

The user clarified **strict 2026/2027 from Football Kit Archive**. Mandatory coverage is **165 ready / 276 slots**, **24 drafts**, **87 researching** and **249 independently saved exact-season references**. There are 111 unfinished mandatory layouts: 84 have references but need artwork/refinement, and 27 lack a matching reference. The 27 gaps are both Real Sociedad pages (404), Petrolul Away (not found), and 24 Finnish slots (archive labels observed kits 2026, not 2026/27). Calendar-year observations are retained separately, never relabeled or applied. No 2026 draft was published.

`data/teams/<team_id>.json` now stores local Home/Away equipment facts for every canonical team. Each verified source entry includes season, design, color names, brand, sponsor, competitions, release date, source URL and checked date. Unresearched/missing values are null. The app's right panel replaces the original-master promotional text with applied-kit details. Data travels with the local applied revision, so candidate changes, failed loads and custom colors cannot silently change the facts. No live archive call occurs in the app. See [mandatory coverage](MANDATORY_TEAMS_2026-27.md).

Eighteen Greek 2026/27 variants passed source/render comparison; Aris Home and OFI Crete Away remain drafts. Brentford Home has a new archive-backed r002/p002 carrying the actual 26-27 archive label, preserving r001's official 2026–2028 provenance and bytes. Global current coverage is **183 ready**, **32 drafts**, **1,255 researching**, **317 saved archive references** (293 exact 2026/27 plus 24 separate 2026 observations) and **169 archive-reviewed adaptations**. The earlier continuation below records the preceding checkpoint.

## Application

React 19.3.0, React DOM 19.3.0, Vite 8.3.0, JavaScript/JSX and CSS, with a locked dependency tree. Dark navy responsive UI, country filter, accent-insensitive team search, separate candidate/applied state, Home/Away, Apply, one central PNG-based shirt, three preview backgrounds, ten-revision collection, previous/next and removal. Home/Away occupy separate collection slots. Missing configurations fail recoverably. Source details and research coverage are available in the UI. Download and ZIP controls are deferred pending the user's later sizing/export requirements.

All 735 original identities, 39 countries/associations, 708 first teams, 27 reserve teams, 779 memberships, 16 workbook tabs, notes, links and hidden rows are preserved. Country names represent the supplied club catalog, not a newly researched set of national teams. No database, AI account or cloud service is required. The user's original base PNG loads once; kit configurations load on demand. Team reference photos and workbook audits are not shipped in the browser catalog. Font assets are local.

The shared renderer supports validated rectangles, polygons, cubic/quadratic/arc paths, linear color gradients, body/sleeve/all clipping, independent sleeve/cuff colors, custom collar geometry and detail layers. Source markup cannot be inserted. Ready revisions cannot be overwritten with changed SVG bytes.

## Current replacement base — 23 September 2026

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
