# Validation — 22 September 2026

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

There are fifteen source-reviewed downloadable kit adaptations, two unapproved drafts and 1,453 researching slots. All 1,470 queries and 297 URL checks have saved checkpoints; these are not equivalent to 1,470 visual reviews. Colors are photo estimates. The exact lighting test does not certify pixel-identical garment artwork. See [STATUS](STATUS.md) and [BASE_ANALYSIS](BASE_ANALYSIS.md).


Quality correction: r002 exports use the original smooth reference-front-2 outline and interpolated source lighting. The additional checks verify 1024-pixel export alpha against the Bézier outline and byte-identical reproduction of all historical r001 SVGs. The raw native lighting test remains an archival-data check; it does not imply the interpolated display is pixel-identical to the original PNG. Before/after crops are under `artifacts/quality-fix`.

23 September continuation: eight additional source-reviewed variants use the unchanged smooth surface. Node geometry/transparency validation includes all saved configurations. The historical r001 reproduction check now selects the legacy surface explicitly, so new r001 kits can correctly use the smooth surface. Forest Away remains non-downloadable pending pattern refinement.

All 11 current ready SVGs were checked against both manifest and saved-revision SHA-256 values; their local reference files exist and their SVGs contain no embedded image, script or foreignObject. The live in-app browser was refreshed and Brentford Home applied successfully with the 2026–2028 season and enabled export. Reports: `artifacts/continuation-2026-09-23/catalog-checks.json`.

Second 23 September continuation: four additional Home variants (Arsenal, Aston Villa, Leeds, Liverpool) pass the same ten Node tests, four browser tests, source-data verification and production build. All 15 ready SVG hashes match the manifest/revision records and their local references exist. Liverpool Home was applied successfully in the live app; transparent preview and enabled SVG export were visible. Aston Villa Away remains a second non-downloadable draft. Report: `artifacts/continuation-2026-09-23-b/catalog-checks.json`.
