import fs from 'node:fs/promises';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const work=await read('data/research/tier2-worklist.json');
// Live history headings and visible kit links checked on 24 September 2026.
const rows=[
['Greece','Anagennisi Karditsa','anagenisi-karditsa-kits-t13075','2025-26',['home','away']],
['Greece','Apollon Kalamaria','apollon-kalamaria-kits-t9864','2025-26',['home','away']],
['Greece','Asteras Tripolis B','asteras-aktor-b-kits-t44029','2025-26',['home','away']],
['Greece','Hellas Syros','ellas-syrou-kits-t20872','2026-27 Home',['away']],
['Greece','Marko','gs-marko-kits-t20878','2025-26',['home','away']],
['Greece','Nestos Chrysoupoli','nestos-chrysoupoli-fc-kits-t9865','2025-26',['home','away']],
['Greece','Niki Volos','niki-volos-fc-kits-t8010','2026-27 Away',['home']],
['Greece','Panserraikos','panserraikos-fc-kits-t11240','2025-26',['home','away']],
['Greece','Panthrakikos','panthrakikos-komotini-kits-t20886','2025-26',['home','away']],
['Greece','PAS Pyrgos','pas-pyrgos-1968-kits-t79558','2025-26',['home','away']],
['Greece','Zakynthos','aps-zakynthos-kits-t12300','2025-26',['home','away']],
['Finland','EIF','ekenas-if-kits-t79513','2025',['home','away']],
['Finland','FC Haka','fc-haka-kits-t1301','2026 Home',['away']],
['Finland','HJK Klubi 04','klubi-04-kits-t12385','2025',['home','away']],
['Finland','JIPPO','jippo-kits-t10641','2025',['home','away']],
['Finland','JäPS','japs-kits-t8338','2025',['home','away']],
['Finland','KTP','kotkan-tyovaen-palloilijat-kits-t1306','2025',['home','away']],
['Finland','KäPa','kapa-kits-t10640','2025',['home','away']],
['Finland','MP','mikkelin-palloilijat-kits-t8335','2025',['home','away']],
['Finland','PK-35','pk-35-vantaa-kits-t79520','2025',['home','away']],
['Finland','SJK Akatemia','sjk-seinajoki-ii-kits-t31908','2025',['home','away']],
];
const batch='tier2-greece-finland-source-gaps-2026-09-24',slots=[];
for(const [country,name,slug,observed,variants] of rows)for(const variant of variants){
 const task=work.tasks.find(t=>t.country_name===country&&t.team_name===name&&t.variant===variant);
 if(!task)throw Error('Unknown canonical slot '+name+variant);
 const file=`data/research/results/${task.task_id}.json`,result=await read(file);
 if(result.status==='ready'||task.reference_path)throw Error('Refusing to block sourced kit '+name+variant);
 const source_url=`https://www.footballkitarchive.com/${slug}/`;
 const remaining=observed.startsWith('2026')?`Archive history includes ${observed} but no independent eligible ${variant} reference. Goalkeeper/other variant cannot substitute.`:`Latest observed archive season is ${observed}; no independently confirmed 2026/27 or calendar-year 2026 ${variant} reference found. Older season not relabeled.`;
 const additional_sources=name==='EIF'?[{url:'https://www.footballkitarchive.com/eif-kits-t8340/',observed_latest:'2024'}]:name==='PK-35'?[{url:'https://www.footballkitarchive.com/pallokerho-35-kits-t8332/',observed_latest:'2024',note:'Separate older-name candidate also checked; no current-season match asserted.'}]:[];
 slots.push({task_id:task.task_id,team_id:task.team_id,team_name:name,country_name:country,variant,source_url,observed_entries:[observed],additional_sources,remaining});
 result.status='blocked';result.kit_season=null;result.reason=remaining;result.remaining=[remaining];
 result.research_log=[...(result.research_log||[]).filter(l=>l.batch!==batch),{date:'2026-09-24',batch,action:'Inspected live FKA competition season listing and individual club history; resolved aliases and reserve identities independently.',source_url,observed_entries:[observed],additional_sources,outcome:remaining}];
 await fs.writeFile(file,JSON.stringify(result,null,2)+'\n');
}
if(slots.length!==39)throw Error('Unexpected source gap count');
await fs.writeFile(`data/research/${batch}.json`,JSON.stringify({checked_at:'2026-09-24',method:'Read-only live browser headings, season sections and kit links, following focused web search or observed listing/history links. Greece: 12 eligible fronts; Finland: FC Haka Home only. No earlier season relabeled; no reserve kit inherited from first team.',listing_urls:['https://www.footballkitarchive.com/super-league-greece-2-kits-2026-27-l891/','https://www.footballkitarchive.com/ykkosliiga-kits-2026-l45525/'],slots},null,2)+'\n');
console.log(slots.length,'documented blocked slots');
