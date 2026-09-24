import fs from 'node:fs/promises';
// Transcribed from the rendered detail-page table and public front-image DOM.
const detail=`AD Ceuta|Home|500405|2026/09/01/hOG4NfJYupcEDsw/ad-ceuta-2026-27-home-kit.jpg|White / Black / Red|Macron|Plain|Ciudad Autónoma de Ceuta|July 27, 2026|26-27
AD Ceuta|Away|500427|2026/09/01/XnEgFWXFT8D6Hm8/ad-ceuta-2026-27-away-kit.jpg|Purple / Black / Pink|Macron|Half-and-half|Ciudad Autónoma de Ceuta|July 27, 2026|26-27
Albacete Balompié|Home|497836|2026/07/30/qhzRsX2cW9i5cbk/albacete-balompie-2026-27-home-kit.jpg|White / Claret|adidas|Plain|Globalcaja|July 21, 2026|26-27
Albacete Balompié|Away|500645|2026/07/30/U3vX2x5T5Y8QlxM/albacete-balompie-2026-27-away-kit.jpg|Green / Pink / Claret|adidas|Chest band|Globalcaja|July 28, 2026|26-27
Burgos CF|Home|490299|2026/09/02/d95eXegR3ExdkFu/burgos-cf-2026-27-home-kit.jpg|White / Black|Macron|Plain|DIGI|June 24, 2026|26-27
Burgos CF|Away|489957|2026/09/02/g8erN59e4EEypFW/burgos-cf-2026-27-away-kit.jpg|Black / Gold|Macron|Plain|DIGI|June 22, 2026|26-27
Cádiz CF|Home|491412|2026/07/01/Hq0wLhi80vKpwER/cadiz-cf-2026-27-home-kit.jpg|Yellow / Navy|Kappa|Plain|DIGI|July 1, 2026|26-27
Cádiz CF|Away|500668|2026/07/29/08mHTPH9zI58pUV/cadiz-cf-2026-27-away-kit.jpg|Navy / White / Sky blue|Kappa|Graphic|DIGI|July 29, 2026|26-27
CD Castellón|Home|491772|2026/09/01/MtfFZ9vYQd7RDqS/cd-castellon-2026-27-home-kit.jpg|Black / White|Erreà|Stripes|DoYouSpain|July 1, 2026|26-27
CD Castellón|Away|496528|2026/09/01/RGzvbofXfZa6sZv/cd-castellon-2026-27-away-kit.jpg|Red / Black / White|Erreà|Chest band|DoYouSpain|July 16, 2026|26-27
CD Eldense|Home|522629|2026/09/21/7xVU3mWlCYZoIsK/cd-eldense-2026-27-home-kit.jpg|Blue / Red|Hummel|Stripes|Ayuntamiento de Elda|September 19, 2026|26-27
CD Eldense|Away|498119|2026/07/22/w5gsjCAsC3g8oZb/cd-eldense-2026-27-away-kit.jpg|Black / White|Hummel|Single stripe|Ayuntamiento de Elda||26-27 (Carry-over)
CD Leganés|Home|491711|2026/07/02/QJ7aWzt618WhbVQ/cd-leganes-2026-27-home-kit.jpg|White / Blue / Gold|Puma|Single stripe|Ontime|July 1, 2026|26-27
CD Leganés|Away|496014|2026/08/23/JrOByb4qoion8FM/cd-leganes-2026-27-away-kit.jpg|Black / Blue / White|Puma|Plain|Ontime|July 15, 2026|26-27
CD Tenerife|Home|494420|2026/07/27/k5MJv9u4VWiZuPm/cd-tenerife-2026-27-home-kit.jpg|Blue / White / Gold|Macron|Half-and-half|Turismo de Tenerife|July 9, 2026|26-27
CD Tenerife|Away|499238|2026/07/27/hKl9SmJFcR27Z6u/cd-tenerife-2026-27-away-kit.jpg|Black / Sky blue|Macron|Plain|Turismo de Tenerife|July 27, 2026|26-27
CE Sabadell|Home|498629|2026/09/03/ioGeCkBPel7bg7a/ce-sabadell-2026-27-home-kit.jpg|Blue / White / Black|Kappa|Quarters||July 23, 2026|26-27
CE Sabadell|Away|506810|2026/09/03/8pu6nMF03ueFLm2/ce-sabadell-2026-27-away-kit.jpg|Black / Gold|Kappa|Plain||August 11, 2026|26-27
Córdoba CF|Home|492419|2026/07/03/2WHvnBhY6xB0INz/cordoba-cf-2026-27-home-kit.jpg|White / Green / Gold|Joma|Stripes|Bahrain Victorious|July 2, 2026|26-27
Córdoba CF|Away|492276|2026/07/02/r5tnWXJwH080dfu/cordoba-cf-2026-27-away-kit.jpg|Black / Gold|Joma|Graphic|Bahrain Victorious|July 2, 2026|26-27
FC Andorra|Home|494091|2026/09/01/fPtIqpEmG7enWOF/fc-andorra-2026-27-home-kit.jpg|Navy / Yellow / Red|Nike|Plain|MoraBanc|July 8, 2026|26-27
FC Andorra|Away|494832|2026/09/01/gBZ2nZ2VyFphhyq/fc-andorra-2026-27-away-kit.jpg|White / Red / Blue|Nike|Single stripe|MoraBanc|July 10, 2026|26-27
Granada CF|Home|500902|2026/09/03/fmoe3wVkWcDxMwJ/granada-cf-2026-27-home-kit.jpg|Red / White / Blue|adidas|Hoops|Sabor Granada|July 29, 2026|26-27
Granada CF|Away|503560|2026/08/09/01Mhe06Yjx3eJo3/granada-cf-2026-27-away-kit.jpg|Navy / Green / Orange|adidas|Graphic|Sabor Granada|August 6, 2026|26-27
RC Celta de Vigo Fortuna|Home|491729|2026/09/01/Q1Xgr1FsOwoBvyj/rc-celta-de-vigo-fortuna-2026-27-home-kit.jpg|Sky blue / Off-white / Red|Hummel|Plain|Estrella Galicia|July 1, 2026|26-27
RC Celta de Vigo Fortuna|Away|491758|2026/09/01/EzQOcm8kYexGPS9/rc-celta-de-vigo-fortuna-2026-27-away-kit.jpg|Navy / Off-white / Red|Hummel|Plain|Estrella Galicia|July 1, 2026|26-27
RCD Mallorca|Home|489549|2026/06/26/rZXUXNL1fz7DSM0/rcd-mallorca-2026-27-home-kit.jpg|Red / Black / White|Nike|Half-and-half|Taica|June 26, 2026|26-27
RCD Mallorca|Away|494100|2026/07/09/esNhIz1XauNRUHk/rcd-mallorca-2026-27-away-kit.jpg|Black / Gold|Nike|Chest band|Taica|July 8, 2026|26-27
Real Oviedo|Home|492943|2026/09/03/z8WjU4yugKquWMX/real-oviedo-2026-27-home-kit.jpg|Blue / White|adidas|Plain|Central Lechera Asturiana|July 4, 2026|26-27
Real Oviedo|Away|492931|2026/09/03/tYaAIUlmszyQKSE/real-oviedo-2026-27-away-kit.jpg|Pink / White / Sky blue|adidas|Chevron|Central Lechera Asturiana|July 4, 2026|26-27
Real Sporting de Gijón|Home|492834|2026/07/08/afXjhAQFEg6ZNSz/real-sporting-de-gijon-2026-27-home-kit.jpg|White / Red / Gold|Siroko|Stripes|Siroko|July 4, 2026|26-27
Real Sporting de Gijón|Away|498211|2026/07/22/h9uGN9aryc00zJg/real-sporting-de-gijon-2026-27-away-kit.jpg|Green / Gold|Siroko|Plain|Siroko|July 22, 2026|26-27
Real Valladolid|Home|496511|2026/07/23/v4BBauxILtIBjno/real-valladolid-2026-27-home-kit.jpg|Purple / White|Reebok|Stripes|Estrella Galicia|July 16, 2026|26-27
Real Valladolid|Away|498514|2026/07/23/OKzpzRUklrEWnrN/real-valladolid-2026-27-away-kit.jpg|Black / Purple / White|Reebok|Stripes|Estrella Galicia|July 23, 2026|26-27
SD Eibar|Home|487065|2026/06/08/gmK3utmIH6qNBR2/sd-eibar-2026-27-home-kit.jpg|Claret / Navy|Hummel|Stripes|Smartlog|June 4, 2026|26-27
SD Eibar|Away|488303|2026/06/11/2gRTZJRAN0XMDWe/sd-eibar-2026-27-away-kit.jpg|White / Red / Claret|Hummel|Diagonal|Smartlog|June 11, 2026|26-27
UD Almería|Home|498529|2026/08/04/yTZuuRGE5Pm34ix/ud-almeria-2026-27-home-kit.jpg|Red / White|Macron|Stripes|Saudi Media Company|July 23, 2026|26-27
UD Almería|Away|504739|2026/09/01/ZVQ8WgVBtG1wpbB/ud-almeria-2026-27-away-kit.jpg|Off-white / Green|Macron|Plain|Saudi Media Company|August 6, 2026|26-27
UD Las Palmas|Home|493421|2026/07/07/yZ8hD6SMTFQr4Dr/ud-las-palmas-2026-27-home-kit.jpg|Yellow / Blue|Hummel|Chest band|Gran Canaria|July 6, 2026|26-27
UD Las Palmas|Away|493420|2026/07/07/xtJScUXB85lFH0R/ud-las-palmas-2026-27-away-kit.jpg|Blue / Yellow|Hummel|Chest band|Gran Canaria|July 6, 2026|26-27`;
const aliases={'Albacete Balompié':'Albacete','Burgos CF':'Burgos','Cádiz CF':'Cádiz','CD Castellón':'Castellón','CD Eldense':'Eldense','CD Leganés':'Leganés','CD Tenerife':'Tenerife','CE Sabadell':'Sabadell','Córdoba CF':'Córdoba','Girona FC':'Girona','Granada CF':'Granada','RC Celta de Vigo Fortuna':'Celta Fortuna','RCD Mallorca':'Mallorca','Real Sporting de Gijón':'Sporting Gijón','SD Eibar':'Eibar','UD Almería':'Almería','UD Las Palmas':'Las Palmas'};
const root='data/research/footballkitarchive/captures',listing='https://www.footballkitarchive.com/la-liga-2-kits-2026-27-l151/';
const header='team\tvariant\tseason\tdesign\tcolors\tbrand\tkit_slug\tkit_id\timage_path\tsponsor\tcompetitions\trelease_date';
const lines=detail.split('\n').map(row=>{const [team,type,id,image,colors,brand,design,sponsor,date,season]=row.split('|');return [team,type,season,design,colors,brand,image.split('/').at(-1).replace(/-kit\.jpg$/,''),id,image,sponsor,'La Liga 2',date].join('\t');});
await fs.writeFile(`${root}/la-liga-2-2026-27.tsv`,[header,...lines].join('\n')+'\n');
await fs.writeFile(`${root}/la-liga-2-2026-27.json`,JSON.stringify({schemaVersion:1,country:'Spain',listing_url:listing,captured_at:'2026-09-24',method:'40 independently opened detail pages and rendered table/front-image DOM. Eldense Away preserves literal 26-27 (Carry-over). The separate listing capture records four 404 details without fabricating their missing table fields.',capture_file:'la-liga-2-2026-27.tsv',record_count:40,team_aliases:aliases},null,2)+'\n');
const fallback=[['Girona FC','Home','489937','2026/06/22/Xhxyt6TzEsMU39p-small/girona-fc-2026-27-home-kit.jpg','Puma'],['Girona FC','Away','493239','2026/07/10/xpnvscgKwkgpmTp-small/girona-fc-2026-27-away-kit.jpg','Puma'],['Real Sociedad B','Home','491565','2026/09/03/IwsK37uvb9Kk9gL-small/real-sociedad-b-2026-27-home-kit.jpg','Joma'],['Real Sociedad B','Away','515469','2026/09/03/dfouBoLLKs2Fy6z-small/real-sociedad-b-2026-27-away-kit.jpg','Joma']];
const fallbackHeader='team\tvariant\tseason\tdesign\tcolors\tbrand\tkit_slug\tkit_id\timage_path';
await fs.writeFile(`${root}/spain-tier2-listing-2026-27.tsv`,[fallbackHeader,...fallback.map(([team,type,id,image,brand])=>[team,type,'26-27','','',brand,image.split('/').at(-1).replace(/-kit\.jpg$/,''),id,image].join('\t'))].join('\n')+'\n');
await fs.writeFile(`${root}/spain-tier2-listing-2026-27.json`,JSON.stringify({schemaVersion:1,country:'Spain',listing_url:listing,captured_at:'2026-09-24',method:'Live season-listing DOM independently names Girona FC and Real Sociedad B Home/Away with their public front-image URLs and brand links. Four detail pages and Girona history return 404. Missing design/color names, sponsor and release fields remain unknown; reduced-size public images retained without guessing alternate image URLs.',capture_file:'spain-tier2-listing-2026-27.tsv',record_count:4,team_aliases:aliases,detail_page_issue:'404 Not Found on each linked detail page; team/season/variant identity and front image verified on league season listing.',failed_detail_pages:fallback.map(([team,type,id,image])=>`https://www.footballkitarchive.com/${image.split('/').at(-1).replace(/-kit\.jpg$/,'')}-kit-${id}/`)},null,2)+'\n');
