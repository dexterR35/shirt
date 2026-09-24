import fs from 'node:fs/promises';
// Observed independently on the twelve rendered FKA detail pages on 24 September.
const text=`AEL Larissa|Home|516832|2026/09/08/sg82r7gqOMkIaJY/ael-larissa-2026-27-home-kit.jpg|Claret / White|Erima|Graphic|Novibet|
AEL Larissa|Away|516831|2026/09/08/wrM0TcliHiYQoAn/ael-larissa-2026-27-away-kit.jpg|White / Red|Erima|Plain|Novibet|
Athens Kallithea|Home|504101|2026/08/06/RRS5uFKBeAfH5dV/athens-kallithea-2026-27-home-kit.jpg|Navy / Sky blue / White|Kappa|Plain|National Museum of Contemporary Art Αthens|August 5, 2026
Athens Kallithea|Away|504100|2026/08/06/cvIfhuFkN3N7Bfk/athens-kallithea-2026-27-away-kit.jpg|White / Navy|Kappa|Hoops|National Museum of Contemporary Art Αthens|August 5, 2026
Ellas Syrou|Home|516344|2026/09/06/EyvJHA2x2134W2O/ellas-syrou-2026-27-home-kit.jpg|White / Blue / Black|Capelli|Graphic||September 1, 2026
Niki Volos FC|Away|512572|2026/08/24/VjMUVgSzowOjlsN/niki-volos-fc-2026-27-away-kit.jpg|White / Blue|Macron|Pinstripes||August 24, 2026
Olympiacos FC B|Home|520631|2026/09/19/ac0sRcIKZkjTJ8s/olympiacos-fc-b-2026-27-home-kit.jpg|Red / White|adidas|Stripes|Stoiximan|
Olympiacos FC B|Away|520625|2026/09/19/EG3d2NtfEbiYJFc/olympiacos-fc-b-2026-27-away-kit.jpg|Off-white / Red / Gold|adidas|Plain|Stoiximan|
Panionios|Home|495506|2026/07/16/KWDZ2RzMr5DqPRK/panionios-2026-27-home-kit.jpg|Blue / Red|Nike|Stripes|Superbet|July 10, 2026
Panionios|Away|496331|2026/07/16/NKnxGmj92QQin61/panionios-2026-27-away-kit.jpg|Gray / White|Nike|Stripes|Superbet|July 10, 2026
PAOK FC B|Home|516830|2026/09/08/fVgWn6hxG4h95J6/paok-fc-b-2026-27-home-kit.jpg|White / Black|Macron|Stripes||
PAOK FC B|Away|516829|2026/09/08/pQpEu9ERH0qN6mu/paok-fc-b-2026-27-away-kit.jpg|White / Black|Macron|Pinstripes||`;
const root='data/research/footballkitarchive/captures',name='greece-tier2-2026-27';
const header='team\tvariant\tseason\tdesign\tcolors\tbrand\tkit_slug\tkit_id\timage_path\tsponsor\tcompetitions\trelease_date';
const rows=text.split('\n').map(row=>{const[team,type,id,image,colors,brand,design,sponsor,date]=row.split('|');return[team,type,'26-27',design,colors,brand,image.split('/').at(-1).replace(/-kit\.jpg$/,''),id,image,sponsor,'Super League Greece 2',date].join('\t');});
await fs.writeFile(`${root}/${name}.tsv`,[header,...rows].join('\n')+'\n');
await fs.writeFile(`${root}/${name}.json`,JSON.stringify({schemaVersion:1,country:'Greece',listing_url:'https://www.footballkitarchive.com/super-league-greece-2-kits-2026-27-l891/',captured_at:'2026-09-24',method:'Twelve independent detail pages, rendered metadata tables and front-image URLs. Reserve-team references captured independently. Blank table fields remain unknown.',capture_file:name+'.tsv',record_count:12,team_aliases:{'AEL Larissa':'AEL','Ellas Syrou':'Hellas Syros','Niki Volos FC':'Niki Volos','Olympiacos FC B':'Olympiacos B','PAOK FC B':'PAOK B'}},null,2)+'\n');
