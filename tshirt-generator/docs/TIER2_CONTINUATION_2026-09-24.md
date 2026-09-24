# Tier 2 continuation — 24 September 2026

This is a progress checkpoint, not Tier 2 completion. The user requested continuation after Tier 1, with the same independently sourced Home/Away workflow and preference for 2026/27 (2026 when unconfirmed).

## Scope and result

The preserved workbook's `Domestic` memberships with `tier === 2` identify **150 canonical teams / 300 slots**, including reserve identities. No source membership, season, ID or queue entry was changed. The reproducible inventory is [tier2-worklist.json](../data/research/tier2-worklist.json).

**103 newly ready kits** join 13 existing Tier 2 kits. All 103 additions have independently saved Football Kit Archive references labeled 2026/27 and individually inspected PNG comparisons. Tier 2 now has **116 ready, 30 draft and 154 researching slots**. There are **160 saved references**, leaving **140 source slots to acquire**; the other 14 researching slots have saved Italian references but no reviewed drawing yet.

| Country | Teams | Slots | Ready | Draft | Researching | Saved references |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| England | 24 | 48 | 41 | 7 | 0 | 48 |
| Spain | 22 | 44 | 0 | 0 | 44 | 0 |
| Italy | 20 | 40 | 26 | 0 | 14 | 40 |
| Germany | 18 | 36 | 25 | 11 | 0 | 36 |
| France | 18 | 36 | 0 | 0 | 36 | 0 |
| Romania | 22 | 44 | 24 | 12 | 8 | 36 |
| Greece | 16 | 32 | 0 | 0 | 32 | 0 |
| Finland | 10 | 20 | 0 | 0 | 20 | 0 |
| **Total** | **150** | **300** | **116** | **30** | **154** | **160** |

Global catalog: **397 ready / 1,470 slots**, 30 drafts and 1,043 researching slots. Football Kit Archive: 444 saved references, 383 reviewed adaptations. Tier 1 remains **276/276 ready**, with exactly its previous 251 × 2026/27, 24 × 2026 and one disclosed 2025/26 fallback.

## Evidence and drawings

New browser captures contain 48 Championship, 36 German second-division and 40 Serie B detail pages, each opened independently from observed listing links. They retain literal source season labels, team aliases, separate Home/Away page and image IDs, design/color names, brand, sponsor, competitions and release date. Images are saved locally with SHA-256 checksums. Source capture files are under `data/research/footballkitarchive/captures/`; source-specific table provenance now travels into each team's offline equipment JSON.

- [Championship listing](https://www.footballkitarchive.com/championship-kits-2026-27-l61/)
- [2. Bundesliga listing](https://www.footballkitarchive.com/2-bundesliga-kits-2026-27-l2/)
- [Serie B listing](https://www.footballkitarchive.com/serie-b-kits-2026-27-l259/)
- [Previously captured Romanian Liga II listing](https://www.footballkitarchive.com/romanian-liga-2-kits-2026-27-l243/)

133 source-specific drawings were compared: England 48, Germany 36, Romania 23 and Italy 26. Individual decisions bind each exact config hash to its local reference hash and comparison sheet:

- [England decisions](../data/research/tier2-england-2026-09-24-review.json): 41 ready / 7 draft.
- [Germany decisions](../data/research/tier2-germany-2026-09-24-review.json): 25 ready / 11 draft.
- [Romania decisions](../data/research/tier2-romania-2026-09-24-review.json): 11 ready / 12 draft; 13 older ready slots retained.
- [Italy decisions](../data/research/tier2-italy-2026-09-24-review.json): 26 ready.

Comparison sheets, individual renders and manifests are under `artifacts/footballkitarchive/tier2-<country>-2026-09-24/`. Ready files are new revisions where predecessors exist. Historical kit/layout files and the original 8000 × 5000 PNG remain unchanged. The catalog contains validated vector paint plus the original PNG fabric; no reference photograph is embedded in paint or exported as artwork.

Colors are visual estimates, not published official HEX. Placement is adapted to the common shirt, and its existing round collar is retained even where a reference has a V or polo construction. Fabric weave, folds and stitching come from the original PNG. Emblems, repeated club symbols, manufacturer symbols, sponsor marks and lettering are omitted. Complex trace crops use constant-color contours with documented scale and reflected repeats, and only passed comparisons become ready. These are Codex reviews, not human approval or a claim of exact photographic reproduction.

## Remaining work

The 30 drawing corrections are explicit per-slot entries in the decision files and result records. They include English scroll/brush/marble prints, German broken linework/lightning/ribbons, and Romanian irregular graphics, yokes and missing side prints. Rejected drafts render as the plain base and cannot be selected as ready kits.

Italy's 14 saved references awaiting artwork: Ascoli Away; Benevento Home/Away; Catanzaro Home/Away; Cremonese Away; Empoli Away; Hellas Verona Away; Padova Away; Palermo Home/Away; Südtirol Home/Away; Vicenza Away.

Romania's missing references: CS Afumați Home/Away, CSC Dumbrăvița Home/Away, CSM Reșița Away, Hermannstadt Home/Away and Politehnica Timișoara Away. Spain, France, Greece and Finland still need their 132 independent references and drawings. These are unfinished research tasks, not claims that the source lacks the kits. No final blocked determination is made.

Prefer verified 2026/27 revisions. If a 2026 fallback is needed, record its independent source and literal label under the per-slot season policy before admission; do not broaden the older Tier 1 fallback exceptions or substitute another variant/team. No fallback was needed in this pass.

## Reproduction and validation

```powershell
node scripts/research/fka-import.mjs --download
node scripts/research/fka-tier2-england-2026-09-24.mjs --reviewed
node scripts/research/fka-tier2-germany-2026-09-24.mjs --reviewed
node scripts/research/fka-tier2-romania-2026-09-24.mjs --reviewed
node scripts/research/fka-tier2-italy-2026-09-24.mjs --reviewed
node scripts/research/tier2-worklist.mjs
npm run build
npm test
npm run data:verify
```

To regenerate a comparison sheet, run `node scripts/research/fka-batch-review.mjs <batch-name>`. Reviewed configurations cannot be changed in place. Use a new batch/revision for corrections to ready kits. Draft decisions must be reviewed again after any config edit.

Validation passed:

- All **65 unit/data/render tests**, including Tier 2 identity, exact review hashes, draft exclusion, equipment provenance and unchanged Tier 1 coverage.
- Preserved workbook audit: 735 teams, 779 memberships, 27 competitions, 39 associations, 16 tabs and 641 hidden All Teams rows.
- Production build: 233 modules; original PNG SHA-256 retained. No per-kit SVG archive regenerated.
- **Five headless Edge browser checks**: new English/German/Italian/Romanian ready kits load without external requests, newly ready Chindia Away renders while Home remains unavailable, existing Tier 1 layouts still load, and Catalog selection rejects drafts and respects capacity.

Windows sandbox process-spawn restrictions required rerunning the normal test/build commands with permission. Playwright's bundled Chromium was absent, so browser checks used the already installed Edge via `PLAYWRIGHT_CHANNEL=msedge`. No application code or dependency change was needed. Nothing was deployed.
