> Current file audit: the supplied `shirt-master.png` is actually the same 200 × 200 translucent highlight as the base PNG, not the older 1024 × 1024 neutral render described below. Original PNGs remain unchanged. The application renderer and native lighting measurements are documented in `../../docs/BASE_ANALYSIS.md`. These legacy examples remain generic.

# Tricouri SVG — master corectat după referință

Revizia `reference-front-2` înlocuiește starterul anterior. Conturul a fost redesenat în vectori după `reference-highlight.png`: umeri rotunjiți, mâneci orientate în jos, corp mai lung, talie ușor ajustată și tiv curbat. Luminile sunt reconstruite în SVG, cu intensitate redusă; fotografia/PNG-ul nu este încorporat în asseturi.

## Fișiere

- `shirt-master.svg`: master neutru, cu grupuri identificabile pentru corp, mâneci, model, manșete, guler, umbre și cusături.
- `svg/`: 8 variante vectoriale și manifestul configurațiilor.
- `png/`: aceleași 8 variante pe fundal cu transparență reală, la 1024 × 1024 px.
- `shirt-engine.mjs`: funcția `renderShirt(config)`, fără dependențe externe.
- `shirt-engine-reference.mjs`: geometria și randarea masterului corectat, folosite de API-ul public.
- `generate.mjs`: export în lot, folosind Node.js.
- `presets.json`: configurațiile editabile ale celor 8 exemple.
- `shirt-master.png`: masterul neutru transparent, la 1024 × 1024 px.
- `preview.png`: masterul și două exemple. `variants-preview.png`: toate cele opt variante. Fundalurile planșelor nu fac parte din tricourile individuale.
- `geometry-check.json`: rezultatele comparației geometrice și verificării transparenței.
- `render-preview.mjs`: randare opțională PNG și preview; necesită biblioteca `sharp` instalată în mediul de lucru.

## Export SVG în lot

Din acest director:

```bash
node generate.mjs presets.json svg
```

Motorul de export SVG nu necesită API AI sau biblioteci suplimentare. PNG-urile incluse au fost randate din aceleași SVG-uri. `node render-preview.mjs` regenerează PNG-urile și masterul când `sharp` este disponibil.

## Configurație

`body`, `secondary`, `sleeves`, `collar` și `cuffs` primesc culori HEX cu 6 cifre. `leftSleeve` și `rightSleeve` permit culori independente și folosesc implicit `sleeves`. `pattern` acceptă `solid`, `vertical`, `horizontal`, `halves`, `sash` și `checks`. `patternScope` este `body` sau `all`. `collarShape` este `round` sau `v`; masterul neutru folosește V, ca în referință. `stripeWidth` și `stripeOffset` sunt păstrate în unități de export 512. `shadingStrength` controlează umbrele suprafeței între 0 și 1, implicit 0.65; gulerul interior și cusăturile au tratament separat.

Perspectiva și geometria sunt comune. Canvasul implicit este 512 × 512, cu `viewBox="0 0 512 512"`. Geometria internă folosește coordonate 200 × 200, aliniate referinței, apoi `translate(32 32) scale(2.24)` pentru padding. Acesta este profilul SVG implicit al generatorului. Pentru export proporțional, folosește aceeași valoare la `width` și `height`.

Gulerele rotund și V sunt desenate în interiorul conturului comun, cu o zonă mai închisă pentru interiorul gâtului. Nu decupează un gol transparent și nu schimbă silueta exterioară. Pentru o croială cu un contur diferit se adaugă un template separat.

## Verificare vizuală

Cele opt variante au măști alpha identice și fundal transparent. Conturul vectorial comparat la 200 × 200 cu pixelii vizibili din referință are aproximativ 98.2% intersecție/suprapunere (IoU). Aceasta este o comparație a siluetei cu un highlight raster, nu o afirmație de reproducere identică a luminilor sau de corectitudine a unui echipament real.

## Echipe și configurații

Acest set conține variante generice de probă, nu echipamente oficiale verificate. Nu include steaguri, logo-uri, sponsori sau text pe tricouri. Nu există asociere automată între aceste configurații și echipele din documentul primit.

În aplicație, echipa, sezonul, tipul echipamentului, sursa și aprobarea se păstrează separat de configurația vizuală. Mai multe echipe pot indica aceeași configurație. Modelele noi sau asimetrice necesită forme SVG suplimentare. În versiunea cerută, configurațiile și SVG-urile se păstrează în fișiere versionate, încărcate de aplicație. Fiecare echipă va avea câte o variantă Home și Away, cu surse independente.

The optional `render-preview.mjs` now writes to `artifacts/starter-preview/` and never replaces the user-supplied PNGs.
