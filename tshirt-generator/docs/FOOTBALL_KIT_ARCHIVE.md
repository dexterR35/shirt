# Football Kit Archive research

The user designated https://www.footballkitarchive.com/ as the source of truth on 23 September 2026. The workbook remains the team inventory: 735 canonical teams and 1,470 separate Home/Away tasks. The source queue and workbook are unchanged.

## Current records

All 735 teams have been searched in 184 saved batches. Exact-name parsing currently identifies candidates for 317 teams; the other teams need further identity/source resolution. The app has 165 ready variants in total, with 1,305 slots still awaiting completed artwork/review (30 drafts and 1,275 researching). The latest continuation added 138 ready variants; see [batch inventory and gaps](CATALOG_CONTINUATION_2026-09-23.md).

`data/research/footballkitarchive/progress.json` contains actual counts. `worklist.json` includes every original task ID, team, association, candidate season, search checkpoint, candidate links and metadata status. Searches do not verify kit identity or artwork. A team without an exact search match still requires browser/source resolution; it is not declared absent from the archive.

Eight browser captures now cover 264 independent Home/Away pages for 134 canonical teams across England, Spain, Italy, Germany, France, Portugal and two Romanian divisions. All 264 public front images are saved with hashes under `data/research/references/footballkitarchive`. Source team names, season labels, design categories, color names, brand, kit IDs and page/image URLs are stored separately from render configurations. The capture has no Third, GK or training slots.

The first twelve archive PNG adaptations passed source/render review: Bournemouth Home, Brighton Home/Away, Chelsea Home, Coventry Away, Everton Home/Away, Fulham Home, Hull Away, Manchester City Home, Sunderland Home and Tottenham Home. Fulham Away remains a draft because its stepped checker edges need closer tracing. Later batches added 138 ready adaptations and retained 28 new drawings as drafts. Other collected references and the fifteen earlier official-source kits still need their respective artwork work or archive reconciliation. Existing reviewed revisions are preserved.

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
