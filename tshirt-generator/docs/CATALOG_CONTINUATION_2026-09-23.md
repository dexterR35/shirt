# Catalog continuation - 23 September 2026

The continuation began with 27 ready variants and 1,443 unfinished slots. It adds **138 ready variants**, reaching **165 ready / 1,470 total**. **1,305 slots remain unfinished: 30 drafts and 1,275 still in research.** This is a saved checkpoint, not completion of the requested 1,443 variants.

The workbook, all 735 canonical IDs, 39 associations and original task queue are unchanged. The original 8000 × 5000 PNG is unchanged. Each ready addition has independent Home/Away page evidence, a locally saved front image with SHA-256, estimated colors, validated paint, an immutable kit/layout revision and a Codex source/render comparison. No human approval is claimed.

## Added artwork

| Batch in `artifacts/footballkitarchive` | Source-specific drawings | Ready additions | Retained drafts |
| --- | ---: | ---: | ---: |
| `spain-2026-09-23` | 27 | 23 | 4 |
| `england-next-2026-09-23` | 10 | 4 | 6 |
| `italy-2026-09-23` | 27 | 26 | 1 |
| `germany-2026-09-23` | 22 | 19 | 3 |
| `france-2026-09-23` | 26 | 22 | 4 |
| `portugal-2026-09-23` | 5 | 5 | 0 |
| `romania-2026-09-23` | 28 | 26 | 2 |
| `romania-liga2-2026-09-23` | 21 | 13 | 8 |
| Total | 166 | 138 | 28 |

Fulham Away already had a draft; its new r002/p002 draft preserves the old revision. Nottingham Forest Away and Aston Villa Away remain earlier drafts, producing 30 unfinished draft slots overall.

## Collected source evidence

264 independent archive references are saved for 134 workbook teams: England 40, Spain 37, Italy 40, Germany 36, France 36, Portugal 8, Romania SuperLiga 31 and Romania Liga 2 36. The archive-review count is 150, including the previous 12 archive adaptations. The other 15 ready variants retain their historical official-source evidence.

Capture-specific aliases map observed archive names to canonical names within the same association; they do not modify team IDs. Explicit `26-27 (Carry-over)` labels are preserved verbatim while the verified kit season is stored as `2026/27`. Unknown season suffixes still fail candidate-season matching.

Portugal and Romanian Liga 2 listing rows outside the workbook are retained separately in artifact TSVs and do not expand the product catalog. League navigation is not added to the UI.

## Concrete remaining work

- 1,206 slots still need an archive detail reference. Existing search candidates are leads, not verified kits or proof of absence.
- Collected references with uncompleted artwork need individual tracing; examples include Nottingham Forest, Benfica, Braga Away, complex Italian Away graphics and several Romanian match-photo references.
- Draft refinements include Atlético Home sleeve continuation, Rayo lightning graphics, Real Madrid Away texture, Manchester City Away bees, Arsenal Away triangles, Fulham Away stepped checks, Dortmund Away diagonals, Werder shoulder panels, Lens Away faceting, Lyon Home shoulder geometry, Le Havre Home panel shape and Oțelul Away texture.
- Chindia Home/Away, FC Bacău Away, CSC Șelimbăr Away and Unirea Slobozia Away need clearer unoccluded front views before ready promotion. Politehnica Home and SCM Râmnicu Vâlcea Home need texture evidence.
- Real Sociedad Home/Away detail URLs returned 404 in the observed La Liga listing. Elche Away and Petrolul Away were absent from their observed league listings. A targeted archive search also did not locate Petrolul 2026/27 Away; this is not a final declaration that no kit exists.

Shoulder bands are placed inside the PNG silhouette, sleeve and cuff colors are independent, and collar paint is clipped to the existing sewn round ring. Sponsors, manufacturer symbols, lettering and emblems are omitted, including repeated emblem/lettering patterns. Color/position estimates and physical collar adaptations remain explicit limitations.

## Resume and reproduce

Use `data/research/footballkitarchive/worklist.json` and each task's result checkpoint. Preserve ready revisions when correcting artwork; create a new revision/batch.

```powershell
node scripts/research/fka-source-sheets.mjs Romania romania-liga2-2026-27
node scripts/research/fka-batch-review.mjs romania-liga2-2026-09-23
node scripts/research/fka-import.mjs --download
npm run catalog:build
```

The `fka-<batch>.mjs --reviewed` scripts reproduce their saved ready/draft decisions. Running an already promoted script without `--reviewed` intentionally fails the immutable-revision guard. Review artifacts contain the original reference beside the composited PNG, rather than metadata-only approval.
