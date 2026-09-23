# Validation — 23 September 2026

## Latest: review of the remaining 42 Tier 1 variants

`npm run data:verify`: **PASS**. All **33 Node tests** and **15 Edge browser tests** pass. Final `npm run build`: **PASS**, after both suites; Vite built 29 modules. Current coverage: **247 ready globally; 229 / 276 mandatory ready**. Mandatory outstanding work is 20 drafts plus 27 slots without exact-season evidence; global outstanding work is 28 drafts and 1,195 researching slots.

All 42 source-backed variants have new revisions and eleven inspected source/render sheets: 22 passed and 20 remain drafts with individual gaps. Tests cover both historical 71-variant and current 42-variant decisions, preserved predecessor drafts, independent 2026/27 references, all 35 source-crop hashes, publication gates, original PNG bytes/alpha and every ready layout. A contour test verifies that holes and ink continuity survive splitting large vector paths into bands.

The new Edge check applies Arsenal, Chelsea, Osasuna, Sassuolo, Monza and Kifisia Away from local JSON, verifies season and the independent source URL, and rejects Toulouse Away without changing the applied pixels or facts. All six screenshots were visually inspected. Existing draft checks now use Milan and Crystal Palace because Monza and Arsenal are ready. The first browser run exposed overly anchored test selectors (the accessible button name includes team initials); those selectors were corrected, and the complete 15-test rerun passed. No external HTTP request occurred during the new interaction flow.

The 8000 × 5000 original PNG remains SHA-256 `4670b8b8dd8d66d22a4b5313aac9e5406d9c0913244a72bdcebe41e347637042`. Existing reviewed SVG bytes are unchanged. `git diff --check` passes. See [the exact 42 outcomes and remaining differences](TIER1_42_REVIEW_2026-09-23.md).

## Previous: 71 remaining source-backed Tier 1 variants

`npm run data:verify`: **PASS**. All **30 Node tests** and **14 Edge browser tests** pass. Final `npm run build`: **PASS**, after both test suites. The catalog contains **225 ready globally; 207 / 276 mandatory ready**. Mandatory remaining work is 42 drafts and 27 slots without exact-season evidence. Global remaining work is 50 drafts and 1,195 researching slots.

All 71 new revisions have inspected source/render comparisons in 18 sheets; 29 passed and 42 remain drafts with explicit per-variant tracing gaps. A new integration check covers every scoped variant, its original team identity, independent 2026/27 evidence, saved revision, review decision and published readiness. No draft receives a reviewed PNG binding. Existing renderer checks validate every saved configuration, all 225 ready PNG bindings, historical SVG bytes, original PNG hash and alpha preservation.

The added Edge check applies Cagliari Home, Manchester City Away, Monaco Away and OFI Crete Away using local JSON, checks each independent source citation and season, then selects Arsenal Away and verifies that the draft cannot replace the applied artwork or facts. All four browser screenshots were inspected. No external HTTP requests occurred. Existing collection, responsive, collar, custom-color and failed-load checks remain passing. Vite built 29 modules successfully; `git diff --check` passes. See [all 71 review outcomes and remaining work](TIER1_71_REVIEW_2026-09-23.md).

## Previous Tier 1 drawing continuation

`npm run data:verify`: **PASS**. All **29 Node tests** and **13 Edge browser tests** pass. All 196 ready PNG layouts resolve and render; historical SVG bytes, full-resolution PNG hash and alpha preservation remain unchanged. All 20 new drawing revisions have inspected source/render comparison sheets. Thirteen are ready and seven remain drafts with concrete refinement notes.

The added browser check applies Werder Bremen Away and Udinese Away, confirms independent 26-27 equipment facts and exact source citations, and rejects Monza Away's draft while preserving the applied Udinese preview/data. Both browser screenshots were inspected. No external HTTP requests occurred. An initial test failure came from selecting Monza's default Home slot; explicitly selecting Away fixed the test, and the complete 13-test rerun passed.

Final `npm run build`: **PASS**, after tests. Vite built all 29 modules. Current manifest: **196 ready globally; 178 / 276 mandatory ready; 249 exact-season mandatory references**. The remaining mandatory slots are 25 drafts and 73 researching. `git diff --check` passes. Batch inventory and visual limits: [Tier 1 continuation](TIER1_CONTINUATION_2026-09-23.md).

## Mandatory team workbook and local equipment JSON

Previous checkpoint: `data:verify`, **29 Node tests** and **12 Edge browser tests** pass. The 138 workbook rows map uniquely to canonical IDs; the workbook hash matches its preserved copy. All 735 local per-team JSON files match their deployed copies. Both mandatory variants remain in the 1,470-slot worklist and all 276 mandatory slots lead it. Missing metadata stays null; 2026 observations do not populate requested 2026/27 facts or become applicable kits. The mandatory drawing pipeline rejects source-season mismatches before writing artwork.

Browser checks verify Manchester United Home/Away details against the saved local JSON, candidate/Apply separation, collection navigation, custom-color labeling and blank-shirt reset. The app makes zero external HTTP requests during these interactions. Removed promotional copy is absent. Elche Away retains the source's `Friendly` metadata without exclusion from team scope. Existing source links, collar paint, ten-item collection, PNG fidelity and responsive checks remain passing. All 183 ready layouts render; source/render comparison grids cover the 20 Greek drawings (18 ready, two draft) and Brentford's archive-season reconciliation.

Final production build: **PASS**, after the final 29 Node / 12 Edge test run. Vite built 29 modules successfully; deployed source PNG remains byte-identical. Current manifest: 183 ready globally, 165 mandatory ready, 249 mandatory exact-season references. `git diff --check` is clean for tracked changes.

## Previous PNG compositor checkpoint

Football Kit Archive continuation: all 25 Node tests and all 10 Edge browser tests pass. Checks cover country-scoped aliases, reserve-team separation, ambiguity, all 264 distinct source capture slots and image hashes, literal carry-over labels, the full 1,470-task worklist, and rejection of challenge pages and goalkeeper kits. All 165 ready PNG layout bindings render successfully. Real Manchester City Home and FCSB Home/Away Apply checks verify source links, completed PNG rendering and draft rejection. Source/render comparisons cover the 166 new drawings; 138 passed visual review, 28 remain drafts. Search checkpoints cover all 735 teams; search coverage is not visual verification.

`npm run data:verify`, all 25 Node tests, ten Edge Playwright tests and the production build pass. The source PNG in `public/assets/base/source.png` is byte-identical to the original 8000 × 5000 file. White-paint composition reproduces source pixels exactly, colored paint retains every alpha value, and all saved kit configurations render as validated paint without embedded texture or lighting. Historical SVGs still reproduce their original bytes.

Follow-up collar regression: eight V/polo layouts were corrected to p002 after the user identified the duplicated collar. All eight closeups were inspected in `artifacts/collar-correction/collars.png`. Tests check unchanged body/shoulder/cuff configurations, absence of collar paint below the original neck, clipping of an oversized custom collar, and real Ipswich Away Apply in the browser. Comparison and browser proof: `artifacts/collar-correction/ipswich-comparison.png` and `studio-ipswich.png`.

Browser checks cover catalog/search/mobile layout, candidate/applied separation, ten Home/Away collection slots, failed configuration recovery, color editing/reset, and real Barcelona rendering with one base-image fetch. The previous SVG/ZIP download checks are superseded while export sizing is deferred. Use `$env:PLAYWRIGHT_CHANNEL='msedge'` before `npm run test:e2e` on this machine.

PNG trim correction: all 15 separate p001 layouts were inspected against saved reference photos in `artifacts/layout-correction/after-1.png` through `after-4.png`. Leeds also uses the user's flat-front photo; `leeds-comparison.png` shows reference/before/corrected. Automated checks resolve every layout against its parent without altering archival configuration, reject missing/wrong/unreviewed layouts, count two rendered shoulder bands on each Leeds shoulder and check visible yellow collar/cuff paint. A real Leeds Apply browser check verifies yellow regions in the composited canvas; the initial single-pixel assertion hit an antialiased boundary, so the final check samples bounded trim regions. Six browser checks passed in the full run, and the corrected Leeds check passed on rerun. `studio-leeds.png` records the result. Review scope is shoulders and trim; original collar construction and previously approximate fabric patterns remain limitations.

## Historical vector reconstruction

The replacement base passes `npm run data:verify`, all twelve Node tests and `npm run build`. All four browser tests passed using installed Edge: in PowerShell set `$env:PLAYWRIGHT_CHANNEL='msedge'` before `npm run test:e2e` (the bundled Chromium executable is absent on this machine). The final sleeve-contour refinement was followed by another successful twelve-test run and production build.

New checks verify the three replacement PNG hashes, >99% alpha silhouette overlap (measured 99.72%), mean interior shading error <7/255, bitmap-free SVG, invariant transparent clipping across configurations, and unchanged SVG bytes for every saved historical kit revision. The neutral app asset and `starter/shirt-svg/base.svg` use identical SVG bytes. Source and vector visual review is in `artifacts/new-base/comparison.png`.

The checks below record the historical implementation.

## Source preservation

`npm run data:verify` passes for all 735 identities, 779 memberships, 27 competition editions, 39 countries/associations, 16 source tabs and 641 hidden All Teams rows. It verifies 1,470 Home/Away slots, preserved season labels, complete seed provenance and matching source palettes. The workbook and original PNGs remain unchanged. The original `PACKAGE_MANIFEST.json` describes the historical handoff, not the files added during implementation.

## Executed checks

| Check | Result |
| --- | --- |
| Production build, React 19.3 / Vite 8.3 | PASS |
| Original lighting vector/native PNG alpha equality | PASS — 0 differing pixels |
| Shared 512 × 512 transparency across neutral + four configurations | PASS |
| One application of the original coordinate transform | PASS |
| Clips contain oversized artwork | PASS |
| No raster, external resource, visible text, script or foreignObject in exports | PASS |
| Reject invalid colors, unsupported markup, paths, clips, NaN and invalid arcs | PASS |
| Search every source identity and combine country/search | PASS |
| Accent-insensitive search | PASS |
| Ten-item maximum, explicit eleventh rejection, duplicates, distinct variants | PASS |
| Candidate changes leave the applied shirt intact | PASS |
| New team candidate resets to Home | PASS |
| Preview/download byte identity | PASS — fixture and actual Barcelona Home |
| Batch navigation/removal and ZIP contents/manifest | PASS |
| Missing SVG retains the prior preview and allows recovery | PASS |
| Mobile 390-pixel viewport has no horizontal overflow | PASS |
| Actual kit browser render has no page errors | PASS |

Ten Node tests and four Playwright browser tests passed. Browser batch/error tests use explicitly synthetic test fixtures; they do not increase kit coverage. An additional browser run exercised the real saved Barcelona Home revision and its download. Historical r001 downloaded SHA-256: `4163188434f9af77af26ae9b13c9e07ea893033f4fe84bdd2fd1f34637d8d102`.

`artifacts/studio-final.png`, `artifacts/studio-original-final.png`, and `artifacts/studio-mobile-final.png` record the current UI. `artifacts/base-analysis.json` records native lighting measurements. `artifacts/verification-summary.json` records source-check/research counts.

## Coverage limits

There are 165 source-reviewed PNG adaptations, 30 drafts and 1,275 researching slots. Downloads remain deferred. All 1,470 original queries, 735 archive-specific team queries and 297 seed URL checks have saved checkpoints; these are not equivalent to 1,470 visual reviews. 264 archive front references are saved, and 150 adaptations have archive-based visual reviews. The fifteen earlier kits still require archive reconciliation. Colors are photo estimates. The exact lighting test does not certify pixel-identical garment artwork. See [STATUS](STATUS.md) and [BASE_ANALYSIS](BASE_ANALYSIS.md).


Quality correction: r002 exports use the original smooth reference-front-2 outline and interpolated source lighting. The additional checks verify 1024-pixel export alpha against the Bézier outline and byte-identical reproduction of all historical r001 SVGs. The raw native lighting test remains an archival-data check; it does not imply the interpolated display is pixel-identical to the original PNG. Before/after crops are under `artifacts/quality-fix`.

23 September continuation: eight additional source-reviewed variants use the unchanged smooth surface. Node geometry/transparency validation includes all saved configurations. The historical r001 reproduction check now selects the legacy surface explicitly, so new r001 kits can correctly use the smooth surface. Forest Away remains non-downloadable pending pattern refinement.

All 11 current ready SVGs were checked against both manifest and saved-revision SHA-256 values; their local reference files exist and their SVGs contain no embedded image, script or foreignObject. The live in-app browser was refreshed and Brentford Home applied successfully with the 2026–2028 season and enabled export. Reports: `artifacts/continuation-2026-09-23/catalog-checks.json`.

Second 23 September continuation: four additional Home variants (Arsenal, Aston Villa, Leeds, Liverpool) pass the same ten Node tests, four browser tests, source-data verification and production build. All 15 ready SVG hashes match the manifest/revision records and their local references exist. Liverpool Home was applied successfully in the live app; transparent preview and enabled SVG export were visible. Aston Villa Away remains a second non-downloadable draft. Report: `artifacts/continuation-2026-09-23-b/catalog-checks.json`.
