import fs from 'node:fs/promises';
// Transcribed from 36 independently opened, rendered archive detail tables and front-image DOM.
const rows=[
['AS Nancy-Lorraine','Home','492767','2026/09/21/k5fxYhpBhNgAdIK/as-nancy-lorraine-2026-27-home-kit.jpg','White / Red','Decathlon','Single stripe','FCGE','July 3, 2026'],
['AS Nancy-Lorraine','Away','502312','2026/09/21/uu35qpTn3BjFI14/as-nancy-lorraine-2026-27-away-kit.jpg','Red / White','Decathlon','Plain','FCGE','July 31, 2026'],
['AS Saint-Étienne','Home','494082','2026/07/09/tGDPQt7t8W2x9Dv/as-saint-etienne-2026-27-home-kit.jpg','Green / White','Hummel','Plain','Groupe Casino','July 8, 2026'],
['AS Saint-Étienne','Away','501546','2026/09/19/ldTx9KXIZCSXGq7/as-saint-etienne-2026-27-away-kit.jpg','Off-white / Green / Blue','Hummel','Pinstripes','Groupe Casino','July 31, 2026'],
['Clermont Foot','Home','501617','2026/08/01/1730zwoLMDk4wFX/clermont-foot-2026-27-home-kit.jpg','Red / Navy / White','Kappa','Stripes','Crédit Agricole','July 31, 2026'],
['Clermont Foot','Away','507798','2026/08/13/49mdh4V3x1aM1ty/clermont-foot-2026-27-away-kit.jpg','Pink / Pink / Navy','Kappa','Stripes','Crédit Agricole','August 13, 2026'],
['Dijon FCO','Home','505369','2026/08/08/QTJMgQXk3UieiLJ/dijon-fco-2026-27-home-kit.jpg','Red / Claret / White','Nike','Stripes','Suez','August 5, 2026'],
['Dijon FCO','Away','505368','2026/08/08/GW5beme8aWcpbna/dijon-fco-2026-27-away-kit.jpg','White / Gray / Yellow','Nike','Graphic','Suez','August 5, 2026'],
['EA Guingamp','Home','494724','2026/07/11/vpbaTj8YuSnPrAu/ea-guingamp-2026-27-home-kit.jpg','Red / Black / White','Kappa','Graphic','Celtigel','July 10, 2026'],
['EA Guingamp','Away','498145','2026/07/22/a2G5vOPKd1WpMaU/ea-guingamp-2026-27-away-kit.jpg','White / Navy / Red','Kappa','Pinstripes','Celtigel','July 22, 2026'],
['FC Annecy','Home','503261','2026/08/03/eQsPwHWFqGsBq7S/fc-annecy-2026-27-home-kit.jpg','Red / Claret','adidas','Pinstripes','MSC','August 3, 2026'],
['FC Annecy','Away','517531','2026/09/14/hl3xFxGKTr3N2fH/fc-annecy-2026-27-away-kit.jpg','White / Red','adidas','Plain','MSC','September 10, 2026'],
['FC Metz','Home','496573','2026/09/21/igVCMiB0rIMBFmI/fc-metz-2026-27-home-kit.jpg','Claret / Gold / White','Kappa','Contrasting sleeves','Car Avenue','July 16, 2026'],
['FC Metz','Away','493873','2026/07/09/nlQBfFfU7Q6vDOC/fc-metz-2026-27-away-kit.jpg','White / Yellow / Green','Kappa','Plain','Car Avenue','July 7, 2026'],
['FC Nantes','Home','488041','2026/06/10/vzdv8FyAR57Azkk/fc-nantes-2026-27-home-kit.jpg','Yellow / Green','Macron','Contrasting sleeves','Synergie','June 9, 2026'],
['FC Nantes','Away','494419','2026/07/09/9XrWWbgNuAdrMw6/fc-nantes-2026-27-away-kit.jpg','Black / Green / Yellow','Macron','Graphic','Synergie','July 9, 2026'],
['Grenoble Foot 38','Home','501281','2026/07/30/NOcLAet9sBjtzt0/grenoble-foot-38-2026-27-home-kit.jpg','Navy / Blue / White','Nike','Half-and-half','Carrefour','July 30, 2026'],
['Grenoble Foot 38','Away','507612','2026/08/12/EqUTishDWmLM2yV/grenoble-foot-38-2026-27-away-kit.jpg','White / Blue','Nike','Graphic','Carrefour','August 12, 2026'],
['Montpellier HSC','Home','498587','2026/07/24/1HwXdPs2XOVlWcU/montpellier-hsc-2026-27-home-kit.jpg','Navy / Red / White','Nike','Single stripe','Swile','July 23, 2026'],
['Montpellier HSC','Away','500840','2026/07/30/nHThXEpxrkNDO9v/montpellier-hsc-2026-27-away-kit.jpg','Orange / White','Nike','Plain','Swile','July 29, 2026'],
['Pau FC','Home','500868','2026/07/30/RMffKnSrFwUKEpN/pau-fc-2026-27-home-kit.jpg','Yellow / Navy / White','Joma','Chest band','Holy Energy','July 29, 2026'],
['Pau FC','Away','503274','2026/08/03/ODtSG1FFhfoi6Xu/pau-fc-2026-27-away-kit.jpg','White / Navy / Yellow','Joma','Contrasting sleeves','Holy Energy','August 3, 2026'],
['Red Star Paris','Home','511368','2026/09/21/43h2D0CQkDYGuHo/red-star-paris-2026-27-home-kit.jpg','Green / White','Kappa','Stripes','Trust IT','August 21, 2026'],
['Red Star Paris','Away','505223','2026/08/17/FaB8bQtZgkitF7U/red-star-paris-2026-27-away-kit.jpg','Black / Green','Kappa','Plain','Trust IT','August 7, 2026'],
['Rodez AF','Home','497823','2026/07/21/VkV92jRXbOVQ5yk/rodez-af-2026-27-home-kit.jpg','Red / Yellow','adidas','Graphic','Maxoutil','July 21, 2026'],
['Rodez AF','Away','507777','2026/09/21/zDmTV6TWh4YNeYt/rodez-af-2026-27-away-kit.jpg','White / Red','adidas','Pinstripes','Maxoutil','August 11, 2026'],
['Sochaux-Montbéliard','Home','496953','2026/09/21/CoaayJwgBgg6V73/sochaux-montbeliard-2026-27-home-kit.jpg','Yellow / Blue / White','Eldera','Plain','EIMI','July 17, 2026'],
['Sochaux-Montbéliard','Away','503413','2026/09/21/fWtJQgi9JsjYyh0/sochaux-montbeliard-2026-27-away-kit.jpg','Blue / Yellow / White','Eldera','Graphic','EIMI','August 1, 2026'],
['Stade de Reims','Home','518585','2026/09/14/nKDy9s3WXe0Qgoh/stade-de-reims-2026-27-home-kit.jpg','Red / White','Puma','Contrasting sleeves','Groupe Charles André','August 14, 2026'],
['Stade de Reims','Away V2','505141','2026/08/10/ioD6qrIjoKaBJNF/stade-de-reims-2026-27-away-v2-kit.jpg','Gray / White / Gold','Puma','Graphic','Groupe Charles André','August 7, 2026'],
['Stade Lavallois Mayenne FC','Home','504734','2026/08/08/twwi04sFwrSBVMf/stade-lavallois-mayenne-fc-2026-27-home-kit.jpg','Orange / Black / Green','Kappa','Plain','Lactel','August 4, 2026'],
['Stade Lavallois Mayenne FC','Away','505519','2026/08/08/Q8seY8vIbVLjR50/stade-lavallois-mayenne-fc-2026-27-away-kit.jpg','White / Green / Black','Kappa','Plain','Lactel','August 7, 2026'],
['US Boulogne CO','Home','503561','2026/09/21/eShDaq1Gj1QU1oe/us-boulogne-co-2026-27-home-kit.jpg','Red / Black','Jako','Stripes','Maxi Groupe','August 3, 2026'],
['US Boulogne CO','Away','502860','2026/08/02/pcAdsf6DG3oEml3/us-boulogne-co-2026-27-away-kit.jpg','White / Red / Black','Jako','Graphic','Maxi Groupe','August 1, 2026'],
['USL Dunkerque','Home','502319','2026/09/21/PLHEp6Z6gUQLrQ1/usl-dunkerque-2026-27-home-kit.jpg','Navy / White / Gold','Hummel','Graphic','Energia Hauts-de-France','July 31, 2026'],
['USL Dunkerque','Away','515146','2026/09/21/ZW46PjcaQM4ib5X/usl-dunkerque-2026-27-away-kit.jpg','White / Claret','Hummel','Plain','Energia Hauts-de-France','']
];
const header='team\tvariant\tseason\tdesign\tcolors\tbrand\tkit_slug\tkit_id\timage_path\tsponsor\tcompetitions\trelease_date\tsource_variant_label';
const lines=rows.map(([team,type,id,image,colors,brand,design,sponsor,date])=>[team,type==='Away V2'?'Away':type,'26-27',design,colors,brand,image.split('/').at(-1).replace(/-kit\.jpg$/,''),id,image,sponsor,'Ligue 2',date,type].join('\t'));
const root='data/research/footballkitarchive/captures',name='ligue-2-2026-27';
await fs.writeFile(`${root}/${name}.tsv`,[header,...lines].join('\n')+'\n');
await fs.writeFile(`${root}/${name}.json`,JSON.stringify({schemaVersion:1,country:'France',listing_url:'https://www.footballkitarchive.com/ligue-2-kits-2026-27-l178/',captured_at:'2026-09-24',method:'Read-only live browser DOM of 36 independent detail pages, following observed Home/Away season-listing anchors. Reims Away V2 is the current listed Away revision; source_variant_label preserves V2. Images and visible table fields recorded separately from artwork approval.',capture_file:name+'.tsv',record_count:36,team_aliases:{'AS Nancy-Lorraine':'Nancy','AS Saint-Étienne':'Saint-Étienne','Clermont Foot':'Clermont','Dijon FCO':'Dijon','EA Guingamp':'Guingamp','FC Annecy':'Annecy','FC Metz':'Metz','FC Nantes':'Nantes','Grenoble Foot 38':'Grenoble','Montpellier HSC':'Montpellier','Pau FC':'Pau','Red Star Paris':'Red Star','Rodez AF':'Rodez','Sochaux-Montbéliard':'Sochaux','Stade de Reims':'Reims','Stade Lavallois Mayenne FC':'Laval','US Boulogne CO':'Boulogne','USL Dunkerque':'Dunkerque'}},null,2)+'\n');
