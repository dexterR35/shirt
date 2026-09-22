# Original PNG analysis — 22 September 2026

Analysis was performed before building the application renderer. The original files remain unchanged.

| File | Actual content |
| --- | --- |
| `starter/shirt-svg/png/base thsirt shape and shadows and paint color.png` | 200 × 200 RGBA highlight layer |
| `starter/shirt-svg/shirt-master.png` | Byte-identical copy of that highlight |
| `references/reference-highlight.png` | Byte-identical copy of that highlight |

All three SHA-256 values are `f34b3ea5e8ddc215e3639f497bb09554a515abb0dc6f7f24ba111f4a2d8c346c`. The older handoff described the master PNG as 1024 × 1024, but the actual supplied files do not match that description.

There are 20,358 pixels with nonzero alpha, 68 distinct nonzero alpha values, and alpha ranges from 1 to 69 out of 255. Every visible RGB value is white. Visible bounds are x=18…180, y=2…198. The file contains the lighting and its negative-space folds; it contains no garment paint color and no separate black shadow layer.

## Quality correction — current display/export surface

The initial pixel-faithful `original-png-vector-1` surface preserved the 200-pixel grid and produced visibly stepped edges when enlarged. That implementation was unsuitable for the requested scalable artwork. The current `original-png-smooth-2` surface restores the supplied reference-front-2 Bézier outline, keeps the same proportions/placement and interpolates the original sampled light map with a 0.55-source-unit SVG Gaussian filter. The outline stays sharp; only lighting is interpolated. No PNG is embedded. The raw light map remains unchanged for reproducibility.

The zero-error native measurement below applies to that raw light map, not to the new interpolated display. The smooth outline is the supplied vector approximation (previously measured at about 98.2% support overlap), not a claim of pixel-identical raster-edge geometry. Existing r001 assets remain unchanged; current kit assets are r002. Enlarged before/after comparisons are in `artifacts/quality-fix/`.

## Original implementation

The previous reference-front-2 renderer retained a hand-drawn contour measured at roughly 98.2% silhouette overlap and substituted simplified vector shadows. The new application keeps its panel geometry, coordinate system and placement, but derives the exterior paint support and light map from the actual PNG.

Horizontal runs with identical alpha become SVG path segments, grouped by their original alpha. There is no `<image>`, raster payload, external image or reference photograph in a kit SVG. Source row extents form the paint support. At the underarms, body and sleeve extents remain separate. Transparent pixels inside a highlight crease are filled with paint: an unlit fold is not a hole in the fabric. The original light paths themselves are unchanged.

Paint, clipped graphic layers and collar/cuff details are composed first. A single outer alpha mask is applied to the assembled garment so overlapping graphics cannot change edge transparency. Original white lighting is placed over the paint. All coordinates are internal 200 × 200 values; the original transform is applied exactly once into a 512 × 512 transparent export.

## Measured fidelity and limits

- Re-rasterizing the vector lighting at 200 × 200 gives **zero alpha mismatches**, maximum error **0/255**.
- All four initial kit configurations and the neutral master have identical 512 × 512 alpha masks.
- The three source files retain their original hashes.
- The pixel-derived exterior preserves the source resolution. Enlargements reveal that finite resolution; this is not a claim of a newly reconstructed smooth high-resolution photograph.
- The zero-error measurement is for the original lighting layer, not for garment color estimates, team pattern placement, or a pixel comparison between the final shirt and an official photograph.
- Reference-front-2 remains the panel template; `original-png-vector-1` identifies this application surface revision.

Reproduce with `npm run base:analyze` and `npm test`. Machine-readable measurements are in `artifacts/base-analysis.json`. The standalone lighting is `artifacts/original-highlight-vector.svg`. The painted neutral master is `public/assets/shirts/original-master.svg`.
