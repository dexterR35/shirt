# Project status

23 September 2026. Application implemented; full visual kit stock remains incomplete.

## Application

React 19.3.0, React DOM 19.3.0, Vite 8.3.0, JavaScript/JSX and CSS, with a locked dependency tree. Dark navy responsive UI, country filter, accent-insensitive team search, separate candidate/applied state, Home/Away, Apply, one central shirt, three preview backgrounds, exact SVG download, ten-revision collection, previous/next, removal and ZIP with manifest. Home/Away occupy separate collection slots. Missing assets fail recoverably. Source details and research coverage are available in the UI.

All 735 original identities, 39 countries/associations, 708 first teams, 27 reserve teams, 779 memberships, 16 workbook tabs, notes, links and hidden rows are preserved. Country names represent the supplied club catalog, not a newly researched set of national teams. No database, AI account or cloud service is required. SVGs load on demand; photos and workbook audits are not shipped in the browser catalog. Font assets are local.

The shared renderer supports validated rectangles, polygons, cubic/quadratic/arc paths, linear color gradients, body/sleeve/all clipping, independent sleeve/cuff colors, custom collar geometry and detail layers. Source markup cannot be inserted. Ready revisions cannot be overwritten with changed SVG bytes.

## Mandatory original base

The actual base/master/highlight PNGs are identical 200 × 200 white transparency layers. Analysis preceded application construction. The raw light map is preserved as vector paths, with zero native-resolution alpha differences. The current display/export interpolates those paths and uses the supplied smooth reference-front-2 Bézier silhouette to eliminate enlarged pixel steps. Original panel coordinates and placement are retained. Current exports use the smooth surface, with new revisions for previously approved kits; historical legacy r001 files are unchanged. Source files are unchanged. See [BASE_ANALYSIS](BASE_ANALYSIS.md) for the measured scope and finite-resolution limitations.

## Research coverage

| Work | Actual count |
| --- | ---: |
| Teams in the app | 735 / 735 |
| Separately queried Home/Away slots | 1,470 / 1,470 |
| Saved discovery batches | 368 |
| Per-slot resumable result records | 1,470 |
| Distinct workbook URLs checked | 297 / 297 |
| Source URL HTTP 200 responses | 293 |
| Source URL failures | 4 |
| Source-reviewed, downloadable vector revisions | 15 |
| Draft artwork needing refinement | 2 |
| Slots still in research | 1,453 |
| Slots with final missing-evidence/blocked determination | 0 |

The fifteen source-reviewed downloadable variants are Barcelona Home/Away, Ipswich Town Home/Away, Brentford Home/Away, Newcastle United Home/Away, Manchester United Home/Away, Liverpool Home/Away, Arsenal Home, Aston Villa Home and Leeds United Home. The twelve additions across the two continuation batches were compared against separately saved official club/manufacturer front photographs on 23 September. Brentford Home retains the official 2026–2028 design label; the other current designs are 2026/27. Each has official source URLs, a saved front photograph, estimated-color evidence, native vector configuration and a Codex visual review. They are adaptations onto the mandatory shared shirt, not claims of pixel-identical photography or published official HEX values. No human approval is claimed.

Ipswich Town Home now uses r003: nested fan/diamond spacing was refined and unsupported white side panels removed. Previous revisions remain unchanged. Nottingham Forest Away is a draft: green/red collar and cuffs are established, but irregular fern-field placement still needs closer tracing. Forest Home has a saved official flat-front photograph; its irregular red marbling is not yet traced. Liverpool Home now uses the complete official short-sleeve flat front, with individually recorded line endpoints and triangle vertices. Aston Villa Away is a second draft: its collar/cuffs are established, but the linked gaslamp fabric texture is not yet accurately reproduced. Arsenal Away and Leeds Away have saved official model photographs and resumable next steps. Every remaining slot retains its query, search response and seed provenance.

The source-specific drawing script is `scripts/research/england-2026-09-23.mjs`; it preserves ready revisions. The second drawing script is `scripts/research/england-second-2026-09-23.mjs`. Review images and comparison grids are under `artifacts/continuation-2026-09-23` and `artifacts/continuation-2026-09-23-b`. New first revisions explicitly use `original-png-smooth-2`; they are not legacy pixel-boundary r001 assets.

All 1,470 queries were submitted, but discovery responses have **not** all been read and visually verified. Search completion must not be reported as kit completion. Remaining slots are `researching`, not falsely marked blocked. Continue source inspection, front-image acquisition, graphic tracing and comparison for the remaining 1,455 non-ready slots.

Four seed URL checks failed: the Ligue 1 and Ligue 2 calendar articles returned 500; the RFEF Primera Federación groups article returned 403; the Veikkausliiga team-statistics page failed to fetch. These are provenance-link failures, not proof that associated kit references are unavailable. Full URLs and outcomes are saved in `data/research/link-checks`.

## Validation

`data:verify`, ten Node tests, four Playwright browser tests and the production build pass. A further real Barcelona Home browser check confirmed byte-identical preview/download and zero page errors. Desktop/mobile screenshots and machine-readable reports are under `artifacts`. See [VALIDATION](VALIDATION.md).

The app is functional. The complete 1,470-kit visual stock is not finished. No background research service or scheduled continuation has been created.
