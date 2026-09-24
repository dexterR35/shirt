import fs from 'node:fs/promises';

const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const memberships=await read('data/normalized/memberships.json');
const queue=await read('data/research/kit-research-queue.json');
const scope=memberships.filter(m=>m.scope==='Domestic'&&m.tier===3);
const ids=new Set(scope.map(m=>m.team_id));
const tasks=[];
for(const task of queue.filter(q=>ids.has(q.team_id))){
  const result=await read(`data/research/results/${task.id}.json`);
  let source=null;
  try {source=await read(`data/research/footballkitarchive/records/${task.id}.json`);}
  catch(error){if(error.code!=='ENOENT')throw error;}
  tasks.push({task_id:task.id,team_id:task.team_id,team_name:task.team_name,country_name:task.country_name,variant:task.kit_variant,candidate_kit_season:task.candidate_kit_season,source_competition_seasons:task.source_competition_seasons,membership_ids:scope.filter(m=>m.team_id===task.team_id).map(m=>m.id),seed_references:task.seed_references,status:result.status,kit_revision_path:result.kit_revision_path??null,reference_path:source?.local_reference_path??null,source_url:source?.page_url??null,remaining:result.remaining??[]});
}
if(ids.size!==383||tasks.length!==766||new Set(tasks.map(t=>t.task_id)).size!==766)throw Error('Tier 3 workbook scope mismatch');
const report={schemaVersion:1,started_at:'2026-09-24',scope_basis:'Preserved workbook Domestic memberships with tier === 3, retaining canonical and reserve identities. This is a resumable inventory, not a claim that all slots have been researched.',season_policy:'Verify each source season and Home/Away identity independently. Preserve literal labels; no automatic older-season or first-team substitutions.',team_count:ids.size,slot_count:tasks.length,countries:[...new Set(tasks.map(t=>t.country_name))].map(country=>({country,teams:new Set(tasks.filter(t=>t.country_name===country).map(t=>t.team_id)).size,ready:tasks.filter(t=>t.country_name===country&&t.status==='ready').length})),counts:Object.fromEntries(['ready','draft','researching','blocked'].map(status=>[status,tasks.filter(t=>t.status===status).length])),references_saved:tasks.filter(t=>t.reference_path).length,tasks};
await fs.writeFile('data/research/tier3-worklist.json',JSON.stringify(report,null,2)+'\n');
console.log({teams:report.team_count,slots:report.slot_count,counts:report.counts,countries:report.countries});
