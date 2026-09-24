import fs from 'node:fs/promises';
// Transcribed from the visible tables and public front links of 16 independent
// detail pages, reached from the observed League One season listing.
const rows = [
  ['AFC Wimbledon','Home','492592','2026/07/05/3C072r0P9HTxKyH/afc-wimbledon-2026-27-home-kit.jpg','Navy / Yellow','Lotto','Plain','Football Manager','July 3, 2026'],
  ['AFC Wimbledon','Away','492754','2026/07/05/Whe30rIOwlSy9P9/afc-wimbledon-2026-27-away-kit.jpg','Red / Gold','Lotto','Plain','World Within','July 2, 2026'],
  ['Barnsley FC','Home','494727','2026/07/11/hF5iT0zIKSYDvjG/barnsley-fc-2026-27-home-kit.jpg','Red / White','Oxen','Plain','The Investment Room','July 10, 2026'],
  ['Barnsley FC','Away','501581','2026/07/31/RK5nTn1XjO49tmi/barnsley-fc-2026-27-away-kit.jpg','Navy / Blue / White','Oxen','Graphic','The Investment Room',''],
  ['Blackpool FC','Home','488074','2026/07/31/kN1PgkvmPQaO2aF/blackpool-fc-2026-27-home-kit.jpg','Orange / White','Puma','Contrasting sleeves','TreadTracker','June 9, 2026'],
  ['Blackpool FC','Away','486444','2026/08/04/KBEiAfDqbhOIa22/blackpool-fc-2026-27-away-kit.jpg','Navy / Sky blue / Orange','Puma','Stripes','TreadTracker','July 30, 2026'],
  ['Bradford City','Home','483523','2026/05/25/t1W71ZFUWa8zH2i/bradford-city-2026-27-home-kit.jpg','Claret / Yellow / Black','Macron','Stripes','JCT600','May 22, 2026'],
  ['Bradford City','Away','493876','2026/07/09/hVnK5iWJVR92ndQ/bradford-city-2026-27-away-kit.jpg','White / Claret / Yellow','Macron','Plain','JCT600','July 7, 2026'],
  ['Bromley FC','Home','480007','2026/09/21/ImH2mmo6SWxlijm/bromley-fc-2026-27-home-kit.jpg','White / Black / Gold','Macron','Pinstripes','LSP Renewables','May 7, 2026'],
  ['Bromley FC','Away','480006','2026/09/21/Lai3VvZymmaevW7/bromley-fc-2026-27-away-kit.jpg','Red / Black','Macron','Stripes','LSP Renewables','May 7, 2026'],
  ['Burton Albion','Home','494901','2026/09/21/muxt1fj9XcLUE4W/burton-albion-2026-27-home-kit.jpg','Yellow / Black','Admiral','Stripes','Fanex Group',''],
  ['Burton Albion','Away','500669','2026/09/21/ScZmAjc6GcBw7wi/burton-albion-2026-27-away-kit.jpg','Navy / Off-white','Admiral','Plain','Fanex Group','July 28, 2026'],
  ['Cambridge United','Home','489255','2026/06/18/KxnG7JEEFXma3b1/cambridge-united-2026-27-home-kit.jpg','Gold / Black','Umbro','Plain','Brooks Sportswear','June 17, 2026'],
  ['Cambridge United','Away','490270','2026/06/26/NJuZ4pdDrUxxVnE/cambridge-united-2026-27-away-kit.jpg','Sky blue / Navy / Gold','Umbro','Plain','Brooks Sportswear','June 24, 2026'],
  ['Doncaster Rovers','Home','486692','2026/06/02/sCBPMO7cmB1Vt8u/doncaster-rovers-2026-27-home-kit.jpg','Red / White / Gold','Oxen','Hoops','Pass Logistics','June 2, 2026'],
  ['Doncaster Rovers','Away','492608','2026/07/04/hrF5gjhl3nUzzqq/doncaster-rovers-2026-27-away-kit.jpg','Blue / Gold / Black','Oxen','Plain','Pass Logistics','July 3, 2026'],
];
const root = 'data/research/footballkitarchive/captures';
const name = 'league-one-a-2026-27';
const header = 'team\tvariant\tseason\tdesign\tcolors\tbrand\tkit_slug\tkit_id\timage_path\tsponsor\tcompetitions\trelease_date';
const lines = rows.map(([team,variant,id,image,colors,brand,design,sponsor,date]) => [team,variant,'26-27',design,colors,brand,image.split('/').at(-1).replace(/-kit\.jpg$/,''),id,image,sponsor,'League One',date].join('\t'));
await fs.writeFile(`${root}/${name}.tsv`,[header,...lines].join('\n')+'\n');
await fs.writeFile(`${root}/${name}.json`,JSON.stringify({schemaVersion:1,country:'England',listing_url:'https://www.footballkitarchive.com/league-one-kits-2026-27-l156/',captured_at:'2026-09-24',method:'Read-only live browser DOM of 16 independent Home/Away detail pages following observed season-listing links. Public front image and each page table recorded separately. Missing release dates remain null. Metadata does not approve artwork.',capture_file:name+'.tsv',record_count:16,team_aliases:{'Barnsley FC':'Barnsley','Blackpool FC':'Blackpool','Bromley FC':'Bromley'}},null,2)+'\n');
