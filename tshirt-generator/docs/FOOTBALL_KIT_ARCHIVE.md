# Football Kit Archive research

The user designated https://www.footballkitarchive.com/ as the source of truth on 23 September 2026. The workbook remains the team inventory: 735 canonical teams and 1,470 separate Home/Away tasks. The source queue and workbook are unchanged.

## Current records

All 735 teams have search checkpoints. The local app has 551 ready, zero draft, 873 researching and 46 blocked variants. Tier 1 is complete: 138 mandatory teams, 276 ready Home/Away variants, including 251 from 2026/27, 24 calendar-year 2026 kits and the explicitly labeled Petrolul Away 2025/26 fallback for 2026. The user requested continuation into Tier 2 using the same approach; it now has 254/300 ready slots, with all 46 remaining slots individually researched and source-blocked. See [Tier 1 completion](TIER1_COMPLETION_2026-09-24.md) and [Tier 2 paint continuation](TIER2_PAINT_2026-09-24.md).

`data/research/footballkitarchive/progress.json` contains actual counts. `worklist.json` includes every original task ID, team, association, candidate season, search checkpoint, candidate links and metadata status. Searches do not verify kit identity or artwork. A team without an exact search match still requires browser/source resolution; it is not declared absent from the archive.

Twenty-three browser captures cover 554 independent Home/Away references for 280 canonical teams: 528 from 2026/27, 25 from 2026 and one from 2025/26. The actual front images are local and hashed. Championship, 2. Bundesliga, Serie B, Ligue 2, Spanish Tier 2, Greek Tier 2 and FC Haka captures include 213 independently opened detail pages, with each page's sponsor, competitions and release date retained in its own capture. Real Sociedad, Girona and Real Sociedad B identities are verified on season listings because their detail pages return 404; Girona and the reserve team's public 500px fronts retain their resolution limitation. Missing table fields remain null. Elche Away remains included despite its Friendly competition label. No Third, GK or training kit is substituted.

Equipment facts are persisted in `data/teams/<team_id>.json`, separately for Home/Away, then materialized into the local browser catalog. Extended table fields include sponsor, competitions and release date, with capture provenance. Missing values remain null. `catalog:build` performs no network fetch; the app reads local JSON and only opens an archive page if the user explicitly follows its citation link.

The latest paint continuation adds 138 ready Tier 2 variants after individual source/render comparisons. There are 537 archive-reviewed adaptations; fourteen other ready variants retain earlier official references. Previous ready revisions are immutable. Fine artwork adaptations and individually inspected comparisons are documented in the [Tier 2 paint review](TIER2_PAINT_2026-09-24.md). The 30 rejected predecessor drawings remain archived; new corrected revisions now serve those slots. Forty-six Romanian, Greek and Finnish source gaps remain unavailable with per-slot history checks and observed season evidence.

The first Tier 3 batch adds 16 ready 2026/27 Home/Away shirts for eight English teams, after independently reading all sixteen detail pages and reviewing their paint. Tier 3 has 383 workbook teams / 766 slots; 750 remain researching. See [the batch report](TIER3_CONTINUATION_2026-09-24.md) and `data/research/tier3-worklist.json`. Earlier Tier 2 figures below are historical batch totals.

## Reproducible commands

```powershell
npm run research:fka:import
npm run research:fka:scrape -- --limit=50
npm run research:fka:review
npm run catalog:build
```

The importer validates captures, uses explicit capture aliases within the supplied country, preserves reserve suffixes and original season labels (including carry-over), rejects ambiguity and seasons outside the requested or explicitly audited fallback scope, downloads public source images with timeouts, and checkpoints each task. It never turns colors or a scraped page into a ready kit. Repeated imports retain completed visual reviews and image hashes.

The HTTP scraper reads observed candidate kit URLs, validates the visible metadata table and records results for further identity/season/visual review. Direct requests currently receive HTTP 403 browser verification; it stops on 403/429 rather than repeatedly requesting the remaining pages. `http-checkpoint.json` records the actual response. This transport failure does not mean a team's kit is unavailable.

Ordinary browser access completed the site's verification normally. `scripts/research/fka-browser-capture.mjs` documents the read-only browser fallback: supply observed listing anchors, read each public kit page's heading/table/image links, and save the capture. Only public front images are used; no Plus-only galleries or hidden endpoints. Search discovery is saved in numbered batches, with the queried canonical team IDs and retrieval date.

## Continue the remaining work

Use the worklist's observed source candidates and previous capture checkpoints, continuing the remaining non-mandatory teams. Confirm association, first/reserve identity, season and exact Home/Away variant on each page. Expand aliases explicitly when an exact country-scoped match is unavailable; do not silently merge teams. Save the public front image, inspect the graphic, create a new revision and compare its PNG rendering against that image.

Color names are source facts; HEX values remain photo estimates. Do not infer an Away kit by swapping Home colors. Do not turn a Graphic design into a generic preset. Retain the original PNG fabric, transparency and sewn round collar. Source emblems, manufacturer symbols, sponsors and lettering are omitted. PNG/WebP/AVIF and collection exports use the same local PNG composite.

Review artifacts are in `artifacts/footballkitarchive`: per-country source sheets, per-batch source/render comparisons, individual PNG adaptations and browser proofs. `fka-source-sheets.mjs <country> [capture-name]` generates source sheets; `fka-batch-review.mjs <batch-name>` renders a saved batch. The country drawing scripts and `fka-save-profiles.mjs` preserve immutable reviewed revisions. Current validation is recorded in [VALIDATION](VALIDATION.md). Tests include local equipment facts, literal seasons, per-slot fallback restrictions, source hashes and draft rejection.
