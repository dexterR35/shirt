# Criterii de acceptare — T-shirt Generator

## Catalog și cercetare

- Identitățile nume + țară coincid exact cu cele 735 de echipe din workbook.
- Toate cele 39 de țări/asociații și echipele de rezerve rămân accesibile.
- Cele 16 taburi, notele, linkurile, apartenențele și rândurile ascunse sunt păstrate ca proveniență.
- Există exact un slot Home și unul Away pentru fiecare echipă: 1.470 în total.
- Toate linkurile inițiale asociate echipei sunt păstrate în fiecare sarcină.
- Codex cercetează separat ambele variante și salvează sezonul confirmat, sursele, datele consultării și referințele.
- Valorile de culoare estimate sunt distincte de cele publicate oficial.
- Un kit gata are configurație, SVG, referință pentru varianta corectă și verificare vizuală documentată.
- O variantă blocată are jurnalul încercărilor și motiv concret; echipa rămâne în catalog.
- Importul reproductibil nu șterge rezultatele cercetării sau reviziile din directoarele separate.

## Interfață și selecție

- Aplicație React + Vite + JavaScript, dark navy, cu țară, căutare echipă și Home/Away.
- Căutarea ignoră diacriticele și majusculele, păstrând numele original la afișare.
- Filtrul de țară și căutarea se combină; toate rezultatele din sursă rămân accesibile.
- Selectarea țării nu selectează automat toate echipele pentru export.
- Selectarea altei echipe candidate pornește cu Home; Aplică schimbă kitul central.
- Schimbarea filtrului sau a selecției candidate nu descarcă și nu înlocuiește accidental kitul deja aplicat.
- Există un singur tricou central; controalele și statusurile nu fac parte din asset.
- Varianta indisponibilă are status și descărcare dezactivată. Un master neutru nu este etichetat ca tricou verificat.
- Layoutul rămâne utilizabil pe desktop și ecrane înguste, cu focus și etichete accesibile.

## Geometrie și fidelitate

- Se folosește silueta reference-front-2, fără schimbarea proporțiilor și poziționării.
- Se verifică vizual kituri cu dungi, panou triunghiular și forme curbate, după sursele corespunzătoare.
- Corpul, mânecile, gulerul și manșetele pot avea culori și detalii independente.
- Straturile custom sunt decupate corect pe corp sau mâneci și nu depășesc silueta.
- SVG-ul este vectorial, fără imagini încorporate, logo-uri, embleme, sponsori sau inscripții.
- Umbre fine, transparență reală, viewBox comun. Culorile nu sunt înlocuite cu preseturi generice pentru a pretinde acoperire.
- Configurațiile sunt validate; markupul extern și scripturile nu pot fi injectate în export.

## Descărcare și lot

- Preview și download folosesc același șir SVG, aceeași revizie și aceeași geometrie.
- Fundalul dark navy și etichetele UI nu apar în fișier.
- Fișierele au nume stabile care identifică echipa, sezonul, varianta și revizia.
- Loturile de 1 și 10 funcționează; al 11-lea element este refuzat explicit.
- Home și Away ale aceleiași echipe sunt elemente distincte. Un duplicat identic nu este adăugat de două ori.
- Săgețile, contorul și elementul activ rămân sincronizate după eliminare sau schimbarea filtrelor.
- ZIP-ul conține doar elementele selectate și manifestul lor.
- Un asset lipsă are eroare clară, fără blocarea restului catalogului.

## Livrare

- Catalogul de aplicație și asseturile salvate funcționează fără cercetare web la fiecare selecție.
- Aplicația nu încarcă toate SVG-urile și fotografiile sursă la prima afișare.
- Build-ul, verificarea datelor și fluxurile esențiale trec.
- STATUS raportează separat implementarea aplicației și acoperirea vizuală: gata / în lucru / blocate.
- Completitudinea înseamnă toate cele 735 de echipe și cele două variante cercetate per echipă. Nu declara finalizat stocul dacă mai există variante fără dovezi.
