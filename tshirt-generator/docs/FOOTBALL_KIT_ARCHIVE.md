# Football Kit Archive research

The user designated https://www.footballkitarchive.com/ as the source of truth on 23 September 2026. The workbook remains the team inventory: 735 canonical teams and 1,470 separate Home/Away tasks. The source queue and workbook are unchanged.

## Current records

All 735 teams have search checkpoints. The local app has 294 ready, 8 draft and 1,168 researching variants. Tier 1 is complete: 138 mandatory teams, 276 ready Home/Away variants, including 251 from 2026/27, 24 calendar-year 2026 kits and the explicitly labeled Petrolul Away 2025/26 fallback for 2026. The latest user instruction permits 2026 fallbacks. See [completion](TIER1_COMPLETION_2026-09-24.md).

`data/research/footballkitarchive/progress.json` contains actual counts. `worklist.json` includes every original task ID, team, association, candidate season, search checkpoint, candidate links and metadata status. Searches do not verify kit identity or artwork. A team without an exact search match still requires browser/source resolution; it is not declared absent from the archive.

Thirteen browser captures cover 320 independent Home/Away references for 161 canonical teams: 295 from 2026/27, 24 from 2026 and one from 2025/26. The actual front images are local and hashed. Real Sociedad identity is verified on the season listing because its detail pages return 404. Missing table fields remain null. Elche Away remains included despite its Friendly competition label. No Third, GK or training kit is substituted.

Equipment facts are persisted in `data/teams/<team_id>.json`, separately for Home/Away, then materialized into the local browser catalog. Extended table fields include sponsor, competitions and release date, with capture provenance. Missing values remain null. `catalog:build` performs no network fetch; the app reads local JSON and only opens an archive page if the user explicitly follows its citation link.

The latest continuation completes the final 43 Tier 1 variants. There are 280 archive-reviewed adaptations; fourteen other ready variants retain earlier official references. Previous ready revisions are immutable. Fine artwork adaptations and independently inspected comparisons are documented in the [completion review](TIER1_COMPLETION_2026-09-24.md).

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

Color names are source facts; HEX values remain photo estimates. Do not infer an Away kit by swapping Home colors. Do not turn a Graphic design into a generic preset. Retain the original PNG fabric, transparency and sewn round collar. Source emblems, manufacturer symbols, sponsors and lettering are omitted. Downloads remain deferred.

Review artifacts are in `artifacts/footballkitarchive`: per-country source sheets, per-batch source/render comparisons, individual PNG adaptations and browser proofs. `fka-source-sheets.mjs <country> [capture-name]` generates source sheets; `fka-batch-review.mjs <batch-name>` renders a saved batch. The country drawing scripts and `fka-save-profiles.mjs` preserve immutable reviewed revisions. Current validation is recorded in [VALIDATION](VALIDATION.md): 53 Node checks and 27 Edge checks verified, followed by a successful production build. Tests include local equipment facts, literal seasons, per-slot fallback restrictions, source hashes and draft rejection.
