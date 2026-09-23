# Football Kit Archive research

The user designated https://www.footballkitarchive.com/ as the source of truth on 23 September 2026. The workbook remains the team inventory: 735 canonical teams and 1,470 separate Home/Away tasks. The source queue and workbook are unchanged.

## Current records

All 735 teams have been searched in 184 saved batches. Exact-name parsing identifies candidates for 317 teams. Current app coverage is 183 ready, 32 draft and 1,255 researching variants. The new workbook prioritizes 138 existing teams and requires **exact 2026/27 archive evidence**: 165 / 276 mandatory variants ready, 249 / 276 references. See [mandatory coverage and gaps](MANDATORY_TEAMS_2026-27.md). Country/team remain the only navigation axes.

`data/research/footballkitarchive/progress.json` contains actual counts. `worklist.json` includes every original task ID, team, association, candidate season, search checkpoint, candidate links and metadata status. Searches do not verify kit identity or artwork. A team without an exact search match still requires browser/source resolution; it is not declared absent from the archive.

Eleven browser captures cover 317 independent Home/Away pages for 160 canonical teams. All front images are saved with hashes under `data/research/references/footballkitarchive`. This includes 293 exact 2026/27 references and 24 Finnish 2026 observations retained as context only; the latter never populate mandatory kit facts or become selectable 2026/27 artwork. Elche Away is included even though the source lists Friendly. Competition does not determine inclusion. The captures have no Third, GK or training substitutions.

Equipment facts are persisted in `data/teams/<team_id>.json`, separately for Home/Away, then materialized into the local browser catalog. Extended table fields include sponsor, competitions and release date, with capture provenance. Missing values remain null. `catalog:build` performs no network fetch; the app reads local JSON and only opens an archive page if the user explicitly follows its citation link.

The first twelve archive adaptations and the preceding 138-variant continuation remain preserved. The latest update adds 18 ready Greek variants, two Greek drafts and a new independent 2026/27 archive binding for Brentford Home. There are 169 current archive-reviewed adaptations; fourteen other current ready variants retain earlier official artwork references. Existing reviewed revisions are immutable.

## Reproducible commands

```powershell
npm run research:fka:import
npm run research:fka:scrape -- --limit=50
npm run research:fka:review
npm run catalog:build
```

The importer validates captures, uses explicit capture aliases within the supplied country, preserves reserve suffixes and original season labels (including carry-over), rejects ambiguity and wrong candidate seasons, downloads public source images with timeouts, and checkpoints each task. It never turns colors or a scraped page into a ready kit. Repeated imports retain completed visual reviews and image hashes.

The HTTP scraper reads observed candidate kit URLs, validates the visible metadata table and records results for further identity/season/visual review. Direct requests currently receive HTTP 403 browser verification; it stops on 403/429 rather than repeatedly requesting the remaining pages. `http-checkpoint.json` records the actual response. This transport failure does not mean a team's kit is unavailable.

Ordinary browser access completed the site's verification normally. `scripts/research/fka-browser-capture.mjs` documents the read-only browser fallback: supply observed listing anchors, read each public kit page's heading/table/image links, and save the capture. Only public front images are used; no Plus-only galleries or hidden endpoints. Search discovery is saved in numbered batches, with the queried canonical team IDs and retrieval date.

## Continue the remaining work

Use the worklist's observed source candidates and previous capture checkpoints, starting with remaining England kits, then the workbook's other teams. Confirm association, first/reserve identity, season and exact Home/Away variant on each page. Expand aliases explicitly when an exact country-scoped match is unavailable; do not silently merge teams. Save the public front image, inspect the graphic, create a new revision and compare its PNG rendering against that image.

Color names are source facts; HEX values remain photo estimates. Do not infer an Away kit by swapping Home colors. Do not turn a Graphic design into a generic preset. Retain the original PNG fabric, transparency and sewn round collar. Source emblems, manufacturer symbols, sponsors and lettering are omitted. Downloads remain deferred.

Review artifacts are in `artifacts/footballkitarchive`: per-country source sheets, per-batch source/render comparisons, individual PNG adaptations and browser proofs. `fka-source-sheets.mjs <country> [capture-name]` generates source sheets; `fka-batch-review.mjs <batch-name>` renders a saved batch. The country drawing scripts and `fka-save-profiles.mjs` preserve immutable reviewed revisions. All 25 Node tests and 10 Edge tests pass, including all 264 source hashes/identities and real independent FCSB Home/Away Apply with draft rejection.
