# Mandatory teams — 24 September 2026

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

The preferred season is **2026/27**, as identified by Football Kit Archive. On 24 September the user permitted independently sourced **2026** fallbacks to complete Tier 1. Workbook palettes are unverified context and never supply verified kit colors. Literal archive labels, including carry-over notes, are retained. Competition fields describe the kit; they do not decide whether a team is included.

## Current coverage

- **276 / 276 ready** with independent local Home/Away references; no mandatory drafts or researching slots remain.
- **251 × 2026/27**, **24 × calendar-year 2026** (all Finnish teams), and **Petrolul Away × 2025/26** as the disclosed fallback for 2026.
- All last 43 variants have individual source/render reviews; see [completion report](TIER1_COMPLETION_2026-09-24.md).
- Real Sociedad detail pages return 404; independently labeled images on the live season listing supply identity and visual evidence. Unknown metadata remains null.
- All Greek variants are now ready. Workbook palettes remain unverified context. Elche Away's source lists Friendly; competition does not exclude a mandatory kit.

Literal source seasons are preserved in the app. The explicit team/variant fallback allowlist lives in `data/research/season-policy.json`; a different season for another slot is still rejected. Sources that do not fit this policy remain research context.

## Local JSON and application

`data/teams/<canonical-team-id>.json` is the local per-team record, with independent `kits.home` and `kits.away`. Fields: season, literal source season, type, design, source color names, brand, sponsor, competitions, release date, ISO date, source URL and checked date. Missing values remain null; missing sponsor data does not mean the shirt has no sponsor. Color names are source facts; pixel/HEX estimates are stored separately with artwork.

Example: `data/teams/team_20e876bedbeb75f01389.json` contains Manchester United Home and Away. Home lists Plain, Red / White / Black, adidas, Snapdragon, Premier League and Champions League, released May 14, 2026. Away has its independent colors and July 22, 2026 date. Both match the inspected archive pages.

`npm run catalog:build` uses only local inputs, writes `/catalog/teams/<id>.json`, and attaches matching-season equipment facts to local revision details. The right panel displays the shown kit's data when the selected team/variant loads. Unready variants show the plain base and an unavailable message. Custom colors are labeled and do not rewrite saved facts. No archive request happens at display time. Existing promotional text and “View original master” are removed.

## Resume

Read `data/research/priority-worklist.json`: all 276 mandatory tasks are first, followed by every other original task. `data/research/priority-teams.json` preserves workbook cells and order. Mandatory work is complete; continue the remaining non-mandatory slots using independent reference checks, drawings and comparison. No metadata-only row is marked ready. The original immutable baseline queue is unchanged.

Re-import the priority workbook using `scripts/import-priority-workbook.py` with the workbook path and a Python runtime with openpyxl. `scripts/research/build-team-equipment.mjs` reproduces local equipment JSON without network access. Extended public table captures and their provenance are in `data/research/footballkitarchive/equipment-fields.tsv` and `equipment-fields-provenance.json`.

Validation commands and results are recorded in `docs/VALIDATION.md`. The complete visual catalog is still unfinished.
