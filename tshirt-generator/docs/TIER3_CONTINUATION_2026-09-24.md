# Active continuation — 25 September 2026

User scope: complete Tier 3 for all canonical teams, Home and Away; no event variants. This is an active checkpoint, not a completion claim.

Current Tier 3 coverage: **383 teams / 766 slots; 195 ready, 0 drafts, 557 researching, 14 blocked**. Global: **730 ready, 0 drafts, 680 researching, 60 blocked** out of 1,470. Prior Tier 1 (276 ready), Tier 2 (254 ready / 46 gaps) and other five ready shirts are preserved.

| Country | Teams | Ready | Researching | Source gaps |
|---|---:|---:|---:|---:|
| England | 24 | 48 | 0 | 0 |
| Germany | 20 | 40 | 0 | 0 |
| France | 18 | 33 | 0 | 3 |
| Spain | 40 | 74 | 0 | 6 |
| Italy | 60 | 0 | 115 | 5 |
| Romania | 96 | 0 | 192 | 0 |
| Greece | 113 | 0 | 226 | 0 |
| Finland | 12 | 0 | 24 | 0 |

All promoted batches have saved independent variant references, validated editable configurations, source/render comparison sheets and per-slot review decisions under `data/research/tier3-*-review.json`. New completed scripts: `fka-tier3-england-b-2026-09-24.mjs` (32), `fka-tier3-germany-2026-09-24.mjs` (40), `fka-tier3-france-2026-09-24.mjs` (33), `fka-tier3-spain-a-2026-09-24.mjs` (38), `fka-tier3-spain-b-2026-09-24.mjs` (36). These ready configurations are immutable; any correction must use a new revision. Detailed observations disclose reduced microprint, fixed round collar, estimated colors, worn/low-resolution images and shared geometry independently verified for reserve teams. Original PNG fabric/alpha preserved; logos, sponsors, lettering and repeated emblems removed.

Current source gaps are evidenced individually in `tier3-france-source-gaps-2026-09-24.json`, `tier3-spain-source-gaps-2026-09-24.json` and `tier3-italy-source-gaps-2026-09-25.json`. They include live team-history URLs and observed alternative entries; no older, third, goalkeeper or event kit substituted. Unchecked countries remain researching.

Next: paint the 115 Italian current Home/Away references captured in `data/research/footballkitarchive/captures/serie-c-2026-27.tsv`; source images/contact sheets are under `artifacts/footballkitarchive/serie-c-2026-27/`. All 60 identities map to canonical workbook teams, including independent reserve pages. AlbinoLeffe Away retains literal `26-27 (Carry-over)` evidence. Then check and complete Romania, Greece and Finland. Continue work autonomously until all Tier 3 slots have been handled. Rebuild catalog and run data, unit and representative download checks after promotion.

---

# Historical first batch — 24 September 2026

The first Tier 3 batch adds **16 ready shirts**: independently sourced 2026/27 Home and Away variants for AFC Wimbledon, Barnsley, Blackpool, Bradford City, Bromley, Burton Albion, Cambridge United and Doncaster Rovers. All sixteen have saved front images, source hashes, editable paint, individually inspected source/render comparisons and immutable r001/p001 revisions. Reviews are by Codex, with `human_approved: false`.

Global coverage is **551 ready, 0 drafts, 873 researching and 46 blocked**. Tier 1 remains **276/276 ready**; Tier 2 remains **254/300 ready** with its 46 previously documented source gaps. No source inventory, prior ready configuration or original PNG bytes changed.

## Evidence and artwork

All sixteen detail pages were opened independently from the [Football Kit Archive League One 2026/27 listing](https://www.footballkitarchive.com/league-one-kits-2026-27-l156/). Each page's own season, variant, design, colors, brand, sponsor, competition and release date were captured. Barnsley Away and Burton Home have no displayed release date; those fields remain null. The app uses local equipment facts.

The capture is `data/research/footballkitarchive/captures/league-one-a-2026-27.tsv`. Its metadata preserves three explicit FC-name aliases within England. Every identity maps uniquely to an existing workbook team ID. Four comparison sheets and sixteen individual PNGs are saved under `artifacts/footballkitarchive/tier3-england-a-2026-09-24/`. Individual decisions and source/configuration hashes are in `data/research/tier3-england-a-2026-09-24-review.json`.

The initial drafts were refined before promotion: Wimbledon Away's hem was aligned to the PNG edge, Barnsley's print scale was corrected, Blackpool Away's central navy stripe was restored, Bromley's side fragments were adjusted, and Burton Home was corrected to four black torso bands around a central gold band.

The original PNG remains the fabric, silhouette, shading and alpha source. Colors are estimates, not published official HEX values. Adaptation limitations:

- Wimbledon Home's repeated Lotto cuff/collar symbols and Away's repeated manufacturer diamonds are omitted. Away retains fine vertical lines and narrow ornamental columns with reduced detail.
- Barnsley Home's faint tonal micro-pattern uses a clean lower-front crop with discrete ink contours. Away's blue dash field is traced separately; logo-covered regions use specified clean print patches. Sleeves use an unobstructed source area at the corrected small scale. Exact hidden print placement is not claimed.
- Blackpool Home's stepped white sleeve bands are editable geometry adapted to the common sleeves. Away retains its independent stripe spacing, pale shoulder panels and orange trim.
- Bradford's polo/V construction is represented only by color bands on the existing round collar. This collar limitation applies throughout the batch.
- Bromley's worn photos require straightening of the stripes. Hidden side artwork is not inferred; manufacturer shoulder marks are removed.
- Burton's archive fronts are flat kit illustrations credited to `fmslovakia.com`, rather than physical garment photos. This limitation is retained. Home and Away have independent pages and images.
- Cambridge Away's visible fine stripes are drawn despite the archive's broad `Plain` design label. Material mesh is not traced.
- Doncaster retains its Home hoops and independently evidenced blue Away. Metallic gold is approximated by flat paint while retaining the PNG highlights.

No source photograph pixels, lettering, sponsors, crests or manufacturer marks are embedded in the color artwork. No per-kit SVG archive was regenerated.

## Resuming

`data/research/tier3-worklist.json` derives the full **383-team / 766-slot** Tier 3 inventory from preserved Domestic memberships. It contains **16 ready and 750 researching** slots; the latter have not been declared blocked. England is **16/48 ready**. Next alphabetically are Huddersfield Town, Leicester City, Leyton Orient and Luton Town, followed by the remaining twelve English teams. Other Tier 3 country groups retain their discovery checkpoints.

Reproducible commands:

```sh
node scripts/research/fka-capture-league-one-a-2026-09-24.mjs
npm run research:fka:import
node scripts/research/fka-source-sheets.mjs England league-one-a-2026-27
node scripts/research/fka-tier3-england-a-2026-09-24.mjs --reviewed
node scripts/research/fka-batch-review.mjs tier3-england-a-2026-09-24
node scripts/research/tier3-worklist.mjs
npm run build
```

The existing review decisions apply only to these exact configurations. Changed ready artwork requires a new revision and comparison. See [validation](VALIDATION.md). This completes the first Tier 3 batch, not Tier 3 or the full 1,470-shirt catalog.
