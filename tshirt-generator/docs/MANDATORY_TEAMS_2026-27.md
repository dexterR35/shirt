# Mandatory teams — 23 September 2026

The user's new workbook contains **138 teams**, all already present under their original canonical IDs. Every row is mandatory, independent of competition. The original 735-team catalog remains intact. Source: `data/source/teams_tier-1_by-tier.xlsx`, sheet `Teams by tier`, A2:F139; SHA-256 `f4efdb011e765bdb0391f336a55703866d5d1091b3435b11e60c271f330d598e`.

| Scope | Teams | Home/Away slots |
| --- | ---: | ---: |
| England | 20 | 40 |
| Italy | 20 | 40 |
| Spain | 20 | 40 |
| Germany | 18 | 36 |
| France | 18 | 36 |
| Romania | 16 | 32 |
| Greece | 14 | 28 |
| Finland | 12 | 24 |
| Total | 138 | 276 |

The requested season is **strictly 2026/27**, as identified by Football Kit Archive. Workbook palettes are unverified context and never supply verified kit colors. Literal archive labels, including carry-over notes, are retained. Competition fields describe the kit; they do not decide whether a team is included.

## Current coverage

- 249 / 276 matching archive references saved locally, with equipment facts.
- 229 / 276 ready PNG adaptations; 20 drafts; 27 researching.
- 47 unfinished layouts: 20 have an exact-season reference but need drawing/refinement; 27 lack a matching reference.
- Latest continuation: all 42 remaining source-backed variants revised and compared, with 22 promoted and 20 retained as drafts. See [the exact inventory and remaining differences](TIER1_42_REVIEW_2026-09-23.md).
- 25 Greek variants are ready. Kifisia Away now has a reviewed revision; Asteras Home and both Panetolikos variants remain drafts.
- Brentford Home r002/p002 independently binds the existing reviewed paint to the archive's 26-27 season; the historical official 2026–2028 revision is unchanged.

Real Sociedad Home and Away are listed but both detail pages return 404, including a fresh follow-up. Petrolul Away was not found in targeted searches or current archive kit listings. Elche Away was found independently of the league page: the source lists `Friendly`, which is retained without excluding the kit.

All 12 Finnish teams have observed calendar-year 2026 Home/Away entries. Those 24 sources are retained under `other_season_references` and do **not** satisfy 2026/27. Twelve exact-season team searches are saved in `strict-season-search-1.json` through `strict-season-search-3.json`; none verified an independent 2026/27 Home/Away entry. No source absence is replaced by a guessed season or generic preset.

## Local JSON and application

`data/teams/<canonical-team-id>.json` is the local per-team record, with independent `kits.home` and `kits.away`. Fields: season, literal source season, type, design, source color names, brand, sponsor, competitions, release date, ISO date, source URL and checked date. Missing values remain null; missing sponsor data does not mean the shirt has no sponsor. Color names are source facts; pixel/HEX estimates are stored separately with artwork.

Example: `data/teams/team_20e876bedbeb75f01389.json` contains Manchester United Home and Away. Home lists Plain, Red / White / Black, adidas, Snapdragon, Premier League and Champions League, released May 14, 2026. Away has its independent colors and July 22, 2026 date. Both match the inspected archive pages.

`npm run catalog:build` uses only local inputs, writes `/catalog/teams/<id>.json`, and attaches matching-season equipment facts to local revision details. The right panel displays the **applied** kit's data. Selecting another team or variant does not change it until Apply succeeds. Custom colors are labeled and do not rewrite saved facts. No archive request happens at display time. Existing promotional text and “View original master” are removed; the color studio's Blank shirt action remains.

## Resume

Read `data/research/priority-worklist.json`: all 276 mandatory tasks are first, followed by every other original task. `data/research/priority-teams.json` preserves workbook cells and order. Continue exact-season reference checks, source-specific drawings and comparison; no metadata-only row is marked ready. The original immutable baseline queue is unchanged.

Re-import the priority workbook using `scripts/import-priority-workbook.py` with the workbook path and a Python runtime with openpyxl. `scripts/research/build-team-equipment.mjs` reproduces local equipment JSON without network access. Extended public table captures and their provenance are in `data/research/footballkitarchive/equipment-fields.tsv` and `equipment-fields-provenance.json`.

Validation: 33 Node tests, 15 Edge browser tests, original data verification and the final production build pass, recorded in `docs/VALIDATION.md`. The complete visual catalog is still unfinished.
