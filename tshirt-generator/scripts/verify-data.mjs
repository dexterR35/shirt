// Check completeness by original identity and source row, not totals alone.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const manifest=read('data/source/source-manifest.json');
assert.equal(sha('data/source/teams-source.xlsx'),manifest.sha256);
assert.equal(sha('data/audit/workbook-audit.json'),manifest.audit_sha256);
const wb=read('data/audit/workbook-audit.json');
const rows=name=>{
  const result={};
  for(const cell of wb.sheets.find(s=>s.name===name).cells){
    const [,column,row]=cell.cell.match(/^([A-Z]+)(\d+)$/);
    if(Number(row)<=6)continue;
    (result[row]??={})[column]=cell.value;
  }
  return Object.entries(result).filter(([,r])=>r.A).map(([row,r])=>({row:Number(row),...r}));
};
const teams=read('data/normalized/teams.json'),memberships=read('data/normalized/memberships.json');
const competitions=read('data/normalized/competitions.json'),countries=read('data/normalized/countries.json');
const sourceRows=rows('All Teams'),paletteRows=rows('Club Colours');
const byTeamId=new Map(teams.map(t=>[t.id,t])),byCompetitionId=new Map(competitions.map(c=>[c.id,c]));
const identity=(name,country)=>JSON.stringify([name,country]);
const expected=new Set(sourceRows.map(r=>identity(r.A,r.B)));
const actual=new Set(teams.map(t=>identity(t.name,t.country_name)));
assert.deepEqual(actual,expected,'A team was omitted, renamed or merged');
assert.equal(actual.size,teams.length,'Duplicate canonical team');
assert.equal(teams.length,735);assert.equal(memberships.length,779);
assert.equal(competitions.length,27);assert.equal(countries.length,39);
assert.equal(wb.sheets.length,16);
const bySourceRow=new Map(memberships.map(m=>[m.provenance.row,m]));
assert.equal(bySourceRow.size,sourceRows.length,'Missing or duplicated source row');
for(const r of sourceRows){
  const m=bySourceRow.get(r.row);assert.ok(m,`Omitted All Teams row ${r.row}`);
  const t=byTeamId.get(m.team_id),c=byCompetitionId.get(m.competition_id);
  assert.ok(t&&c,`Broken foreign key at ${r.row}`);
  assert.equal(identity(t.name,t.country_name),identity(r.A,r.B));
  assert.equal(c.name,r.C);assert.equal(m.tier_raw,r.D);assert.equal(m.group_or_phase,r.E);
  assert.equal(m.season,r.F);assert.equal(m.scope,r.G);assert.equal(m.team_type,r.H);
  for(const [field,col] of [['notes','I'],['source_id','J'],['source_url','K']])assert.equal(m[field],r[col]??null);
  for(const [field,col] of [['primary','L'],['secondary','M'],['coverage','N'],['evidence_basis','O'],['source_url','P'],['notes','Q']])assert.equal(m.imported_palette[field],r[col]??null);
  assert.ok(t.membership_ids.includes(m.id));
  assert.equal(m.provenance.sheet,'All Teams');assert.equal(m.provenance.workbook_sha256,manifest.sha256);
}
const byIdentity=new Map(teams.map(t=>[identity(t.name,t.country_name),t]));
for(const r of paletteRows){
  const t=byIdentity.get(identity(r.A,r.B));assert.ok(t);
  for(const [field,col] of [['primary_name','C'],['secondary_name','D'],['primary_hex_illustrative','E'],['secondary_hex_illustrative','F'],['coverage','G'],['evidence_basis','H'],['source_id','I'],['source_url','J'],['reference_year','K'],['notes','L']])assert.equal(t.palette[field],r[col]??null);
  assert.equal(t.palette.is_official_hex,false);
}
for(const c of competitions){
  const n=memberships.filter(m=>m.competition_id===c.id).length;
  assert.equal(n,c.expected_memberships);assert.equal(n,c.listed_memberships);
}
// Country and UEFA sheets are views of the full membership table, not extra teams.
const membershipTuple=r=>JSON.stringify([r.A,r.B,r.C,r.D,r.E,r.F,r.G,r.H]);
const sourceTuples=new Set(sourceRows.map(membershipTuple));
for(const name of ['England','Spain','Italy','Germany','France','Romania','Greece','Finland','UEFA']){
  const regional=rows(name);
  for(const r of regional)assert.ok(sourceTuples.has(membershipTuple(r)),`Orphan in ${name} row ${r.row}`);
  const expectedRows=sourceRows.filter(r=>name==='UEFA'?r.G==='UEFA':r.G==='Domestic'&&r.B===name);
  assert.deepEqual(new Set(regional.map(membershipTuple)),new Set(expectedRows.map(membershipTuple)),`View mismatch ${name}`);
}
const queue=read('data/research/kit-research-queue.json');
const requiredResearch=new Set(teams.flatMap(t=>['home','away'].map(variant=>JSON.stringify([t.id,variant]))));
const actualResearch=new Set(queue.map(q=>JSON.stringify([q.team_id,q.kit_variant])));
assert.deepEqual(actualResearch,requiredResearch);assert.equal(queue.length,requiredResearch.size);
assert.equal(queue.length,1470);assert.equal(new Set(queue.map(q=>q.id)).size,1470);
assert.ok(queue.every(q=>q.status==='unresearched'&&q.reference_url===null&&q.config_path===null),'Transfer must not falsely mark kit research complete');
for(const q of queue){
  const team=byTeamId.get(q.team_id);
  const tm=memberships.filter(m=>m.team_id===q.team_id);
  assert.equal(q.team_name,team.name);assert.equal(q.country_name,team.country_name);
  assert.deepEqual(q.source_competition_seasons,[...new Set(tm.map(m=>m.season))].sort());
  const domesticSeasons=[...new Set(tm.filter(m=>m.scope==='Domestic').map(m=>m.season))];
  const candidateSeason=domesticSeasons.length===1?domesticSeasons[0]:q.source_competition_seasons.length===1?q.source_competition_seasons[0]:null;
  assert.equal(q.candidate_kit_season,candidateSeason);
  assert.equal(q.kit_season,null,'Source season is not a researched kit season');
  assert.equal(q.local_reference_path,null);assert.equal(q.source_checked_at,null);
  assert.ok(q.research_queries.every(query=>query.includes(q.kit_variant)));
  const expectedUrls=new Set([
    team.palette.source_url,
    ...memberships.filter(m=>m.team_id===q.team_id).flatMap(m=>[m.source_url,m.imported_palette.source_url])
  ].filter(url=>url&&/^https?:\/\//.test(url)));
  assert.deepEqual(new Set(q.seed_references.map(s=>s.url)),expectedUrls,`Missing research link for ${team.name}`);
  assert.equal(q.assigned_to,'codex');assert.equal(q.requires_web_research,true);
  assert.ok(q.seed_references.every(s=>s.provenance.length>0),'Research links need provenance');
}
const report=read('data/coverage-report.json');
assert.equal(report.nonempty_source_cells,wb.sheets.reduce((n,s)=>n+s.cells.length,0));
assert.equal(report.hyperlink_occurrences,wb.sheets.reduce((n,s)=>n+s.hyperlinks.length,0));
assert.equal(report.verified_current_kits,0);
assert.equal(report.research_task_count,1470);assert.equal(report.research_tasks_with_seed_links,1470);
assert.equal(report.kit_slots_per_team,2);assert.deepEqual(report.requested_kit_variants,['home','away']);
const facets=read('data/normalized/facets.json');
assert.deepEqual(Object.keys(facets).sort(),['countries','kit_variants']);
assert.deepEqual(facets.kit_variants,['home','away']);
assert.equal(facets.countries.reduce((sum,c)=>sum+c.team_count,0),735);
for(const c of facets.countries)assert.equal(c.team_count,teams.filter(t=>t.country_id===c.id).length);
const kups=teams.find(t=>t.name==='KuPS'&&t.country_name==='Finland');assert.ok(kups);
for(const q of queue.filter(q=>q.team_id===kups.id)){
  assert.deepEqual(q.source_competition_seasons,['2026','2026/27']);
  assert.equal(q.candidate_kit_season,'2026');
}
const hidden=wb.sheets.find(s=>s.name==='All Teams').hidden_rows.map(Number);
assert.equal(hidden.length,641);
for(const rn of hidden)if(sourceRows.some(r=>r.row===rn))assert.ok(bySourceRow.has(rn));
console.log(`PASS: ${teams.length} teams; ${memberships.length} memberships; ${competitions.length} competitions; ${countries.length} countries/associations; all ${wb.sheets.length} sheets and ${hidden.length} hidden All Teams rows retained.`);
console.log(`PASS: ${queue.length} research slots cover Home + Away for every team; all source season labels, membership fields and palette fields match.`);
console.log(`PASS: Every research task includes the team's existing source links, with roles and provenance.`);
console.log('PASS: App facets contain country counts and Home/Away only; source seasons remain distinct from verified kit seasons.');
