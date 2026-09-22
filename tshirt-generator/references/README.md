# Referințe vizuale

- `reference-shirt-sheet.png`, dacă este prezent: imaginea furnizată de utilizator cu exemple de tricouri naționale. Este o referință de stil și varietate; nu este catalogul celor 735 de cluburi și nu stabilește sezoanele sau grafica actuală. Nu include imaginea ori watermarkul ei în asseturile finale.
- `reference-highlight.png`: PNG-ul indicat de utilizator la https://widgets.sir.sportradar.com/assets/media/highlight.b1ac6c3e.png și atașat din nou ca referință principală de corecție. PNG RGBA 200 × 200, highlight alb cu alpha maxim 69/255. **Conturul său este baza masterului corectat `reference-front-2`.** Luminile sunt redesenate în vectori și simplificate pentru stilul flat-soft; nu se încorporează PNG-ul în asseturile finale.
- `../starter/shirt-svg/preview.png`: masterul corectat și două exemple generice. `variants-preview.png` arată toate cele opt exemple. Nu sunt echipamente verificate ale unor echipe.

Pentru fiecare kit real, documentează separat referința de echipă/sezon/variantă. Aceste trei referințe nu înlocuiesc cercetarea celor 735 de echipe.


Current analysis: all three supplied base/master/highlight PNGs share the same SHA-256 and 200 × 200 dimensions. The app preserves their original light map as vector paths; see `../docs/BASE_ANALYSIS.md`. Official team references are stored separately in `../data/research/references`.
