import fs from 'node:fs/promises';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const teams=await read('data/normalized/teams.json'),memberships=await read('data/normalized/memberships.json'),queue=await read('data/research/kit-research-queue.json');
const scope=memberships.filter(m=>m.scope==='Domestic'&&m.tier===2),ids=new Set(scope.map(m=>m.team_id));
const tasks=[];
for(const q of queue.filter(q=>ids.has(q.team_id))){
  const result=await read(`data/research/results/${q.id}.json`);
  let source=null;try{source=await read(`data/research/footballkitarchive/records/${q.id}.json`);}catch(e){if(e.code!=='ENOENT')throw e;}
  tasks.push({task_id:q.id,team_id:q.team_id,team_name:q.team_name,country_name:q.country_name,variant:q.kit_variant,candidate_kit_season:q.candidate_kit_season,source_competition_seasons:q.source_competition_seasons,membership_ids:scope.filter(m=>m.team_id===q.team_id).map(m=>m.id),seed_references:q.seed_references,status:result.status,kit_revision_path:result.kit_revision_path??null,reference_path:source?.local_reference_path??null,source_url:source?.page_url??null,remaining:result.remaining??[]});
}
const report={schemaVersion:1,requested_at:'2026-09-24',scope_basis:'Preserved workbook Domestic memberships with tier === 2; canonical identities and reserve teams retained.',season_policy:'Prefer independently evidenced 2026/27; accept 2026 when unconfirmed, with literal seasons and per-slot evidence. No automatic older-season or first-team substitution.',team_count:ids.size,slot_count:tasks.length,countries:[...new Set(tasks.map(t=>t.country_name))].map(country=>({country,teams:teams.filter(t=>ids.has(t.id)&&t.country_name===country).length,ready:tasks.filter(t=>t.country_name===country&&t.status==='ready').length})),counts:Object.fromEntries(['ready','draft','researching','blocked'].map(s=>[s,tasks.filter(t=>t.status===s).length])),references_saved:tasks.filter(t=>t.reference_path).length,tasks};
if(ids.size!==150||tasks.length!==300||new Set(tasks.map(t=>t.task_id)).size!==300)throw Error('Tier 2 scope mismatch');
await fs.writeFile('data/research/tier2-worklist.json',JSON.stringify(report,null,2)+'\n');
console.log({teams:report.team_count,slots:report.slot_count,counts:report.counts,references:report.references_saved,countries:report.countries});
