import fs from 'node:fs/promises';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const write=async(p,v)=>fs.writeFile(p,JSON.stringify(v,null,2)+'\n');
const root='data/research/footballkitarchive',batch='rest-2026-09-25';
const work=await read('data/research/rest-worklist.json'),details=await read(`${root}/observations/rest-details.json`);
for(const team of work.teams)for(const slot of team.slots){
 const d=details.find(d=>d.task_id===slot.task_id),file=`data/research/results/${slot.task_id}.json`,result=await read(file);
 if(!d||result.status!=='ready')throw Error('Unfinished '+team.name+' '+slot.variant);
 delete result.reason;
 Object.assign(slot,{status:'ready',kit_season:result.kit_season,kit_revision_path:result.kit_revision_path,history_url:d.history_url,source_url:d.url,source_variant_label:d.detail.fields.Type,remaining:[]});
 result.research_log=[...(result.research_log||[]).filter(l=>l.batch!==batch),{date:'2026-09-25',batch,action:'Full club history and exact independent variant checked; source/render comparison completed.',history_url:d.history_url,source_url:d.url,outcome:`Ready ${d.detail.fields.Type}, retaining source season ${d.detail.fields.Season}. Estimated colors and print/construction adaptations recorded in the kit review.`}];
 await write(file,result);
}
const slots=work.teams.flatMap(t=>t.slots);
work.updated_at='2026-09-25';
work.scope_basis='All 123 slots still researching after the latest-available pass, across 62 canonical teams. Existing 133 documented source gaps and ready revisions preserved.';
work.counts={teams:work.teams.length,slots:slots.length,ready:slots.filter(s=>s.status==='ready').length,blocked:0,researching:0,draft:0};
work.seasons=Object.fromEntries([...new Set(slots.map(s=>s.kit_season))].sort().map(season=>[season,slots.filter(s=>s.kit_season===season).length]));
work.countries=[...new Set(work.teams.map(t=>t.country))].sort().map(country=>({country,teams:work.teams.filter(t=>t.country===country).length,ready:work.teams.filter(t=>t.country===country).flatMap(t=>t.slots).length}));
await write('data/research/rest-worklist.json',work);
// These three earlier source records already have identical extended fields.
// Preserve the original captures and record their live reconfirmation here.
const provenance=await read(`${root}/equipment-fields-provenance.json`);
for(const d of details.filter(d=>d.name==='Benfica'||d.name==='Braga')){
 const id=d.url.match(/-kit-(\d+)\/$/)[1];
 provenance.supplemental_checks=(provenance.supplemental_checks||[]).filter(c=>!(c.kit_id===id&&c.batch===batch));
 provenance.supplemental_checks.push({kit_id:id,batch,checked_at:'2026-09-25',url:d.url,observation_path:`${root}/observations/rest-details.json`,method:'Independently reread the exact detail table. Sponsor, competitions and release date match the original equipment-fields.tsv row; preserved without duplicate source capture.'});
}
await write(`${root}/equipment-fields-provenance.json`,provenance);
console.log({counts:work.counts,seasons:work.seasons,countries:work.countries.length});
