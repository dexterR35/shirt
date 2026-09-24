# Validation - 24 September 2026

## Latest: Tier 3 England first batch

Sixteen independent 2026/27 Home/Away shirts are ready; global coverage is **551 ready**, with Tier 1 and Tier 2 unchanged. All **78 Node tests pass** (85.3 seconds), including the original PNG, historical configuration locks, source image hashes, all saved paint, the 383-team Tier 3 inventory, the exact 16 published configurations and their independent equipment fields. `npm run data:verify` passes with all 735 identities, 779 memberships, 27 competitions, 39 associations, 16 tabs and 1,470 slots preserved. `npm run build` passes, with 233 modules. `git diff --check` passes.

The new Chromium browser check passes (9.4 seconds total). It selects both variants of all eight teams, checks the kit identity, ready render and individual season/brand facts, then downloads Barnsley and Blackpool Home/Away as four distinct transparent **168 × 168 PNGs**. Output dimensions, alpha and distinct image hashes were verified; no external display requests occurred. The resulting Studio screenshot was visually inspected. Four source/render comparison sheets cover all sixteen additions; the corrected sheets were inspected before ready promotion.

Review scope and limitations, including Burton's illustrated sources, fine print and hidden regions, are recorded in [the batch report](TIER3_CONTINUATION_2026-09-24.md). Tier 3 remains **16/766 ready**, with **750 researching**, and is not complete.

## Previous: Tier 2 painted continuation

24 September checkpoint: **254 / 300 Tier 2 slots ready**, **535 ready globally**. All **76 Node tests pass** (140.8 seconds), including independent source hashes, immutable prior revisions, the original PNG bytes/alpha, all reviewed layouts, literal FC Haka 2026 season, the 46 documented blocked slots and preservation of empty final TSV fields. **Eight targeted Edge browser tests pass** (41 seconds): new Tier 2 variants load from local JSON, source equipment stays variant-specific, missing slots remain unavailable, and Catalog selection still works. Three representative shirts (Córdoba Away, Hellas Syros Home, FC Haka Home) were exported from the collection as distinct transparent 168 × 168 PNGs; dimensions, alpha and distinct image bytes were verified. The final FC Haka Studio screenshot was visually inspected.

`npm run data:verify`: **PASS** (735 teams, 779 memberships, 27 competitions, 39 associations, 16 tabs and 1,470 independent slots preserved). `npm run build`: **PASS**, 233 modules. `git diff --check`: **PASS**. All 138 new ready designs have individually inspected comparison sheets; their source and adaptation limitations are documented in [the paint report](TIER2_PAINT_2026-09-24.md). Tier 1 remains 276/276. Tier 2 has no current drafts or unchecked slots; its 46 remaining slots are unavailable because eligible independent source evidence was not found in the checked histories. This validation does not claim all 300 slots are ready.


## Previous: complete Tier 1 with explicit season fallbacks

`npm run data:verify`: **PASS**. All **53 Node tests** pass. **27 Edge browser tests verified**: the full run passed 26 and exposed one obsolete expectation that SuperLiga still had unavailable shirts; that test now asserts all 32 are ready and checks unavailable drafts in Liga II, and its targeted rerun passes. Final `npm run build`: **PASS**, after verification; Vite built 231 modules. `git diff --check`: **PASS**. Empty final release-date cells in the equipment TSV are intentional and documented in its whitespace attribute.

Mandatory coverage: **276 ready / 276 slots** (251 labeled 2026/27, 24 labeled 2026, one Petrolul Away fallback labeled 2025/26). Global: **294 ready / 8 drafts / 1,168 researching**. All 43 new variants have independently saved sources, individual reviewed configurations and preserved predecessors. Eleven source/render comparison sheets and seven new Studio screenshots were inspected. The realistic PNG base, round collar and original alpha remain intact. Detailed print and sponsor-obscured regions have explicit adaptation limitations.

Tests verify the complete mandatory inventory, source hashes, literal season labels, per-slot fallback restrictions, historical lineage, immutable configuration hashes and local equipment metadata. Browser checks cover calendar-year Home/Away switching, Real Sociedad, Lorient, Bayer, Panetolikos and the explicitly labeled Petrolul fallback, without external source requests. Existing editing, export/ZIP, routing and collection checks also passed. Twenty-nine earlier screenshots were restored from pre-run copies.

Two intermediate catalog builds encountered transient Windows file-open errors on different generated files; the subsequent catalog generation and final full production build completed successfully. The original PNG hash remains `4670b8b8dd8d66d22a4b5313aac9e5406d9c0913244a72bdcebe41e347637042`. No per-kit SVG archive was generated. See [the completion inventory](TIER1_COMPLETION_2026-09-24.md).

## Previous: Milan, Venezia and Lorient Away continuation

`npm run data:verify`: **PASS**. All **52 Node tests** and **26 Edge browser tests** pass. Final `npm run build`: **PASS**, after both suites; Vite built 231 modules. `git diff --check`: **PASS**. Global coverage: **251 ready / 24 drafts / 1,195 researching**. Mandatory coverage: **233 ready / 16 drafts / 27 researching**.

Milan Away r004/p004 and Venezia Away r003/p003 passed source/render comparison and are available; Lorient Away r003/p003 remains a draft because the ornament and cuff scrolls need more detail. All three have explicit predecessor paths, individual decisions and independently rechecked 2026/27 Away pages. Lorient's fragmented threshold study is marked unused; the subsequent manual curve study is retained for continuation. Equipment facts remain local per team.

Tests cover exact-season source bindings, revision lineage, publication gates, trace hashes and original PNG preservation. The new browser flow selects both ready Away shirts, checks their pale rendered pixels and equipment data, then verifies that Lorient Away shows the plain base and unavailable message. No external requests occurred. Both resulting browser screenshots were visually inspected. Existing editing, export/ZIP, routing and collection tests also pass. Historical browser screenshots were restored from copies taken immediately before this run, preserving earlier evidence.

See [the comparison and remaining gaps](TIER1_ORNAMENTS_2026-09-24.md). The original PNG and previously reviewed configuration hashes remain unchanged; the removed per-kit SVG archive is not regenerated.

## Previous: source-specific refinements and preview readiness

`npm run data:verify`: **PASS**. All **51 Node tests** and **25 Edge browser tests** pass. Final `npm run build`: **PASS**, after both suites; Vite built 231 modules. Global coverage is **249 ready / 26 drafts / 1,195 researching**. Mandatory coverage is **231 ready / 18 drafts / 27 researching**. All 735 teams and the unchanged 8000 × 5000 PNG remain available.

Four new r003/p003 source-specific revisions were compared with their independently saved 2026/27 images. Union Berlin Home and Toulouse Away passed; Lorient Home and Bayer Leverkusen Away retain concrete visual gaps. Tests verify fixed draft predecessors, source URLs and hashes, explicit promotion decisions, dates, deployed PNG bindings and equipment metadata. The removed per-kit SVG archive was not regenerated.

The first Node run exposed a pre-existing Windows line-ending assumption in the CSS token test; normalizing CRLF in that test fixed it without changing CSS. The first browser run exposed an Arsenal test that sampled before the selected kit loaded. Visual inspection then showed the preview could briefly report a new configuration as ready while still displaying old pixels. `PngShirtPreview` now associates readiness with the painted configuration and cache mode. The browser check explicitly inspects pale Toulouse Away pixels and red Union Berlin Home pixels before saving proof, and still verifies that Lorient's draft shows the plain base. Both final screenshots were visually inspected. All 25 browser checks, including editing, downloads, routing, collection and button stability, passed after the fix.

The original base remains SHA-256 `4670b8b8dd8d66d22a4b5313aac9e5406d9c0913244a72bdcebe41e347637042`; prior ready configurations pass the immutable hash checks. See [the review and remaining gaps](TIER1_REFINEMENT_2026-09-24.md). This batch does not complete the catalog.

## Previous: review of the remaining 42 Tier 1 variants

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
| Original lighting vector/native PNG alpha equality | PASS - 0 differing pixels |
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
| Preview/download byte identity | PASS - fixture and actual Barcelona Home |
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
