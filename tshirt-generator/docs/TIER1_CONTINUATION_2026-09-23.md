# Tier 1 artwork continuation - 23 September 2026

Twenty exact-season variants received new source-specific drawing revisions and PNG/source comparison sheets. Thirteen passed this review, moving mandatory coverage from 165 to **178 / 276 ready**. Seven drawings remain drafts. This is a visual adaptation review by Codex, not human approval or a claim of photographic reproduction. Estimated HEX colors remain distinct from source color names.

## New ready variants

| Country | Team | Variant |
| --- | --- | --- |
| Germany | Bayer Leverkusen | Home |
| Germany | Mainz 05 | Home, Away |
| Germany | Schalke 04 | Home |
| Germany | TSG Hoffenheim | Home |
| Germany | Werder Bremen | Home, Away |
| Italy | Atalanta | Away |
| Italy | Lazio | Away |
| Italy | Torino | Home |
| Italy | Udinese | Away |
| Romania | FC Botoșani | Away |
| Romania | Sepsi OSK | Away |

Collar colors and ornament follow the original sewn round ring. Shoulder tapes, raglan inserts, patterned fields and cuff edges use the shared 200-unit paint coordinates. Emblems, manufacturer marks, sponsors and lettering remain absent from the artwork; their equipment metadata stays in local per-team JSON. Mainz Home intentionally omits repeated initials and badge motifs inside the geometric lattice.

## Drafts retained after comparison

| Variant | Concrete remaining difference |
| --- | --- |
| Borussia Dortmund Away | Lightning-edge positions and widths remain too angular. |
| TSG Hoffenheim Away | Pale brush microtexture needs irregular tracing rather than straight bands. |
| Monza Away | Curved dot trajectories and fading zones remain too regular. |
| Parma Away | Square tiles need the source's concentric arcs rather than a wavy grid. |
| Milan Away | Feather overlap boundaries and graduated shading remain incomplete. |
| Dinamo București Away | Faint ivory printed mottling within pale vertical stripes is missing. |
| Oțelul Galați Away | Fading hexagon field and pale mesh insert boundaries need refinement and a clearer front image. |

These are saved as drafts and cannot be applied as verified kits. Other unfinished variants were not promoted merely because their source colors or metadata are known.

## Reproduce and resume

Scripts: `scripts/research/fka-mandatory-{germany,italy,romania}-next-2026-09-23.mjs`. Run with `--reviewed` to reproduce the final reviewed/draft split; running without that flag after promotion is intentionally refused by the immutable revision guard. Each batch manifest is under `artifacts/footballkitarchive/mandatory-<country>-next-2026-09-23/manifest.json`; it binds source image, kit and PNG layout paths. Comparison sheets and individual PNGs are adjacent. Regenerate sheets with `node scripts/research/fka-batch-review.mjs <batch-name>`.

The importer refreshes research counts from local evidence; `npm run catalog:build` materializes the catalog and equipment JSON. Existing reviewed revisions and their SVG bytes are unchanged. `data/research/priority-worklist.json` is the resume point.

Current global coverage: **196 ready, 33 draft, 1,241 researching**. Mandatory: **178 ready, 25 draft, 73 researching**. Of 98 unfinished mandatory slots, 71 have exact-season references and 27 lack matching evidence. Missing evidence remains the two Real Sociedad detail pages, Petrolul Away and 24 Finnish slots whose observed archive season is 2026 rather than 2026/27. No new source-access claims are made in this drawing-only continuation.

Validation: original catalog verification, 29 Node tests, 13 Edge tests and the final production build pass. The browser applies new Werder and Udinese layouts with local source facts and keeps Monza Away's draft unavailable. Original PNG and historical SVG integrity checks pass.
