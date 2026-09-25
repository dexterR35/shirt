import fs from 'node:fs/promises';

const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const write=async(p,v)=>fs.writeFile(p,JSON.stringify(v,null,2)+'\n');
const work=await read('data/research/latest-available-worklist.json');
const root='data/research/footballkitarchive';
const details=await read(`${root}/observations/latest-available-details.json`);
const histories=await read(`${root}/observations/latest-available-histories.json`);
const policy=await read('data/research/season-policy.json');
const batch='latest-available-2026-09-25';
const identityNotes={
 'Academica Recea':'The current Academica Recea and the former Comuna Recea archive identity have unresolved continuity. Do not assign the dissolved club\'s historical equipment to the canonical current team.',
 'CS Drobeta Turnu Severin':'The newly established CS Drobeta is distinct from the historical FC Drobeta and CS Turnu Severin identities. No independently verified current-club Home/Away source was found.'
};
for(const slot of work.slots){
 const path=`data/research/results/${slot.task_id}.json`,result=await read(path);
 const detail=details.find(d=>d.task_id===slot.task_id);
 const checkedHistories=histories.filter(h=>h.slots?.some(s=>s.task_id===slot.task_id));
 const historyUrls=[...new Set([...(detail?[detail.history_url]:[]),...checkedHistories.map(h=>h.url)])];
 let outcome;
 if(detail){
  if(result.status!=='ready')throw Error(`Review not finished: ${slot.name} ${slot.variant}`);
  delete result.reason;
  outcome=`Latest independently labeled ${slot.variant} kit selected from the checked history, retaining ${result.kit_season}. Individually compared reference and original-PNG adaptation; estimated colors and construction limitations documented.`;
  Object.assign(slot,{status:'ready',kit_season:result.kit_season,kit_revision_path:result.kit_revision_path,source_url:detail.url,checked_history_urls:historyUrls,remaining:[]});
  delete slot.gap_category;
  const fallback=policy.fallbacks.find(p=>p.team_id===slot.team_id&&p.variant===slot.variant&&p.season===result.kit_season);
  if(fallback)fallback.reason=`Latest independently labeled ${slot.variant} source found in the live team history; no newer independently labeled equipment found for this slot. User authorized latest available equipment on 25 September 2026. Actual source season retained.`;
 }else{
  const gapCategory=identityNotes[slot.name]?'ambiguous_club_identity':slot.history_urls.length?'no_independent_variant':'no_verified_archive_identity';
  outcome=identityNotes[slot.name]||(slot.history_urls.length
   ?`Full available club history checked under the latest-equipment policy. No independently labeled ${slot.variant} reference found for the canonical team, including older seasons. Other variants and first-team equipment are not substituted.`
   :`The preceding full archive source pass found no verified club history or independently labeled ${slot.variant} reference for this canonical identity. Removing the season cutoff does not resolve that source gap; the earlier search evidence is retained in the research log.`);
  if(result.status!=='blocked')throw Error(`Unexpected gap status: ${slot.name}`);
  result.reason=outcome;result.remaining=[outcome];
  Object.assign(slot,{status:'blocked',kit_season:null,gap_category:gapCategory,checked_history_urls:historyUrls,remaining:[outcome]});
 }
 result.research_log=[...(result.research_log||[]).filter(l=>l.batch!==batch),{date:'2026-09-25',batch,action:detail?'Selected latest source and completed source/render comparison.':slot.history_urls.length?'Reviewed full available history and canonical identity.':'Reassessed documented source gap under the new season policy.',history_urls:historyUrls,...(detail?{source_url:detail.url}:{}),outcome}];
 await write(path,result);
}
work.updated_at='2026-09-25';
work.scope_basis='264 previously blocked Tier 2/Tier 3 slots. All 89 known archive history URLs rechecked; prior full source-pass searches retained for identities without a verified archive history.';
work.counts=Object.fromEntries(['ready','blocked'].map(status=>[status,work.slots.filter(s=>s.status===status).length]));
work.countries=[...new Set(work.slots.map(s=>s.country))].map(country=>({country,ready:work.slots.filter(s=>s.country===country&&s.status==='ready').length,blocked:work.slots.filter(s=>s.country===country&&s.status==='blocked').length}));
work.gap_categories=Object.fromEntries([...new Set(work.slots.filter(s=>s.gap_category).map(s=>s.gap_category))].map(category=>[category,work.slots.filter(s=>s.gap_category===category).length]));
await write('data/research/latest-available-worklist.json',work);
await write('data/research/season-policy.json',policy);
console.log({counts:work.counts,countries:work.countries,gap_categories:work.gap_categories});
