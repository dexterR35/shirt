# Tier 1 completion — 24 September 2026

All **138 mandatory teams / 276 Home and Away slots** are available in the local catalog. This continuation completes the last **43 variants** (16 existing drafts and 27 previously unsourced or season-gated slots). All 735 canonical teams remain intact.

| Source season | Ready mandatory slots |
| --- | ---: |
| 2026/27 | 251 |
| 2026 | 24 |
| 2025/26 — Petrolul Away fallback for 2026 | 1 |
| Total | 276 |

The user's latest instruction permits 2026 when 2026/27 is unconfirmed. Each fallback is explicitly scoped to a team, variant and literal season in `data/research/season-policy.json`; no season is relabeled. Petrolul has no separate verified 2026/27 Away entry, so the independently observed 2025/26 garment is included as a disclosed fallback. The 24 Finnish variants use their calendar-year 2026 sources.

Real Sociedad Home/Away are independently identified on the [archive season listing](https://www.footballkitarchive.com/la-liga-kits-2026-27-l150/). Their individual detail pages still return 404, so missing table facts remain null and the usable listing URL is stored. The live Oțelul Away page reconfirms 26-27, adidas, MrBit and July 23, 2026. Petrolul's sponsor and competitions are captured separately with their own checked date.

Equipment data stays in `data/teams/<team_id>.json`. The application and build read local data only. Research photos remain local evidence and are not embedded in the displayed paint. The original 8000 × 5000 PNG and its sewn round collar are unchanged.

## Visual review

All eleven source/render sheets were inspected. Several iterations corrected missing print regions, shoulder/cuff colors, brand exclusions, and large graphic placement. Every new revision has an individual decision and a reviewed configuration hash. Previous ready revisions and draft predecessors are retained. These are **source-specific adaptations**, not pixel-identical replicas: fine print, photograph perspective and areas hidden by sponsors are simplified or reconstructed. This is a Codex review, not human approval.

Examples of documented simplification: Crystal Palace feathers, Frosinone/Argeș architecture, Rennes timber frames, Lorient grain/paisley, Bayer mineral veins, Panetolikos portrait contours obscured by the sponsor, and KuPS/TPS print. Brand marks and lettering are omitted.

| Team | Variant | Source season | New revision | Comparison sheet |
| --- | --- | --- | --- | ---: |
| Crystal Palace | away | 2026/27 | r003 / p003 | 1 |
| Nottingham Forest | home | 2026/27 | r003 / p003 | 1 |
| Osasuna | home | 2026/27 | r003 / p003 | 1 |
| Real Sociedad | home | 2026/27 | r001 / p001 | 1 |
| Real Sociedad | away | 2026/27 | r001 / p001 | 2 |
| Frosinone | home | 2026/27 | r003 / p003 | 2 |
| Frosinone | away | 2026/27 | r003 / p003 | 2 |
| Bayer Leverkusen | away | 2026/27 | r004 / p004 | 2 |
| RB Leipzig | away | 2026/27 | r003 / p003 | 3 |
| Lorient | home | 2026/27 | r004 / p004 | 3 |
| Lorient | away | 2026/27 | r004 / p004 | 3 |
| Rennes | home | 2026/27 | r003 / p003 | 3 |
| Troyes | home | 2026/27 | r003 / p003 | 4 |
| FC Argeș | home | 2026/27 | r003 / p003 | 4 |
| Oțelul Galați | away | 2026/27 | r005 / p005 | 4 |
| Petrolul Ploiești | away | 2025/26 | r001 / p001 | 4 |
| Asteras Tripolis | home | 2026/27 | r003 / p003 | 5 |
| Panetolikos | home | 2026/27 | r003 / p003 | 5 |
| Panetolikos | away | 2026/27 | r003 / p003 | 5 |
| AC Oulu | home | 2026 | r001 / p001 | 5 |
| AC Oulu | away | 2026 | r001 / p001 | 6 |
| FC Inter Turku | home | 2026 | r001 / p001 | 6 |
| FC Inter Turku | away | 2026 | r001 / p001 | 6 |
| FC Lahti | home | 2026 | r001 / p001 | 6 |
| FC Lahti | away | 2026 | r001 / p001 | 7 |
| FF Jaro | home | 2026 | r001 / p001 | 7 |
| FF Jaro | away | 2026 | r001 / p001 | 7 |
| HJK | home | 2026 | r001 / p001 | 7 |
| HJK | away | 2026 | r001 / p001 | 8 |
| IF Gnistan | home | 2026 | r001 / p001 | 8 |
| IF Gnistan | away | 2026 | r001 / p001 | 8 |
| IFK Mariehamn | home | 2026 | r001 / p001 | 8 |
| IFK Mariehamn | away | 2026 | r001 / p001 | 9 |
| Ilves | home | 2026 | r001 / p001 | 9 |
| Ilves | away | 2026 | r001 / p001 | 9 |
| KuPS | home | 2026 | r001 / p001 | 9 |
| KuPS | away | 2026 | r001 / p001 | 10 |
| SJK | home | 2026 | r001 / p001 | 10 |
| SJK | away | 2026 | r001 / p001 | 10 |
| TPS | home | 2026 | r001 / p001 | 10 |
| TPS | away | 2026 | r001 / p001 | 11 |
| VPS | home | 2026 | r001 / p001 | 11 |
| VPS | away | 2026 | r001 / p001 | 11 |

Review decisions: `data/research/tier1-completion-2026-09-24-review.json`. Source checks and original capture dates: `data/research/tier1-completion-2026-09-24-source-checks.json`. Fixed continuation scope, source ink crops, independent images and comparisons are retained next to these records and under `artifacts/footballkitarchive/tier1-completion-2026-09-24/`. Reproduce with `node scripts/research/fka-completion-2026-09-24.mjs --reviewed`; changed paint invalidates the recorded review hash.

## Catalog boundary

Global coverage is **294 ready, 8 drafts, 1,168 researching**; 320 saved Football Kit Archive references and 280 archive-reviewed adaptations. Tier 1 is complete. The remaining 1,176 unfinished slots belong to the wider catalog. See [validation](VALIDATION.md) for the final test and build results.
