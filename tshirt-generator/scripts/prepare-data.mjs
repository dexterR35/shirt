// Dependency-free normalization of the supplied, fully preserved workbook audit.
// This is a transfer tool, not a live spreadsheet connector or kit researcher.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const write = (p,data) => fs.writeFileSync(path.join(root,p), JSON.stringify(data,null,2)+'\n');
const hash = v => crypto.createHash('sha256').update(v).digest('hex');
const id = (kind,...parts) => `${kind}_${hash(JSON.stringify(parts)).slice(0,20)}`;
const fold = s => s.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const sourceManifest = read('data/source/source-manifest.json');
assert.equal(hash(fs.readFileSync(path.join(root,'data/source/teams-source.xlsx'))),sourceManifest.sha256,'Source workbook changed');
assert.equal(hash(fs.readFileSync(path.join(root,'data/audit/workbook-audit.json'))),sourceManifest.audit_sha256,'Source audit changed');
const workbook=read('data/audit/workbook-audit.json');
const sheets=new Map(workbook.sheets.map(s=>[s.name,s]));
const sheetRows = name => {
  const rows=new Map();
  for(const c of sheets.get(name).cells){
    const [,col,n]=c.cell.match(/^([A-Z]+)(\d+)$/);
    const rn=Number(n); if(!rows.has(rn)) rows.set(rn,{row:rn});
    rows.get(rn)[col]=c.value;
  }
  return [...rows.values()].sort((a,b)=>a.row-b.row);
};
const table = name => sheetRows(name).filter(r=>r.row>6&&r.A);
const provenance = (sheet,r) => ({sheet,row:r.row,workbook_sha256:sourceManifest.sha256});
const intOrNull = value => value!=null&&value!==''&&Number.isFinite(Number(value))?Number(value):null;
const all=table('All Teams');
const palettes=table('Club Colours');
const identity = (name,country)=>JSON.stringify([country,name]);
const paletteMap=new Map(palettes.map(r=>[identity(r.A,r.B),r]));
assert.equal(paletteMap.size,palettes.length,'Repeated country/name in palette table');

const countries=[...new Set(all.map(r=>r.B))].sort().map(label=>({id:id('country',label),name:label,kind:'football_country_or_association',iso_code:null}));
const countryMap=new Map(countries.map(c=>[c.name,c]));
const competitions=table('Competitions').map(r=>({
  id:id('competition',r.A,r.B,r.D),name:r.B,country_or_system:r.A,
  country_id:countryMap.get(r.A)?.id??null,season:r.D,tier:intOrNull(r.C),
  tier_raw:r.C,group_count:intOrNull(r.E),expected_memberships:intOrNull(r.F),
  listed_memberships:intOrNull(r.G),source_check:r.H,scope:r.I,
  notes:r.J??null,source_id:r.K??null,source_url:r.L??null,
  verification_status:'imported_snapshot',provenance:provenance('Competitions',r)
}));
const competitionMap=new Map(competitions.map(c=>[JSON.stringify([c.country_or_system,c.name,c.season]),c]));
const teamsMap=new Map();
const memberships=all.map(r=>{
  const key=identity(r.A,r.B),teamId=id('team',r.B,r.A);
  if(!teamsMap.has(key)){
    const p=paletteMap.get(key); assert.ok(p,`Missing palette row for ${key}`);
    teamsMap.set(key,{
      id:teamId,name:r.A,country_id:countryMap.get(r.B).id,country_name:r.B,
      sport:'football',gender:'men',entity_type:'club',source_team_types:[],
      search_text:fold(`${r.A} ${r.B}`),aliases:[],membership_ids:[],
      palette:{primary_name:p.C??null,secondary_name:p.D??null,
        primary_hex_illustrative:p.E??null,secondary_hex_illustrative:p.F??null,
        coverage:p.G??null,evidence_basis:p.H??null,source_id:p.I??null,
        source_url:p.J??null,reference_year:p.K??null,notes:p.L??null,
        is_official_hex:false,provenance:provenance('Club Colours',p)},
      kit_research_status:'unresearched',verified_kit_count:0,
      provenance:[]
    });
  }
  const t=teamsMap.get(key);
  if(!t.source_team_types.includes(r.H))t.source_team_types.push(r.H);
  t.provenance.push(provenance('All Teams',r));
  const compKey=JSON.stringify([r.G==='UEFA'?'UEFA':r.B,r.C,r.F]);
  const comp=competitionMap.get(compKey);assert.ok(comp,`Unmapped competition ${compKey}`);
  const m={id:id('membership',teamId,comp.id,r.E),team_id:teamId,
    competition_id:comp.id,country_id:t.country_id,season:r.F,scope:r.G,
    tier:intOrNull(r.D),tier_raw:r.D,group_or_phase:r.E,team_type:r.H,
    notes:r.I??null,source_id:r.J??null,source_url:r.K??null,
    imported_palette:{primary:r.L??null,secondary:r.M??null,coverage:r.N??null,
      evidence_basis:r.O??null,source_url:r.P??null,notes:r.Q??null},
    verification_status:'imported_snapshot',provenance:provenance('All Teams',r)};
  t.membership_ids.push(m.id);return m;
});
const teams=[...teamsMap.values()];
assert.equal(new Set(memberships.map(m=>m.id)).size,memberships.length,'Duplicate membership keys');
assert.equal(new Set(teams.map(t=>t.id)).size,teams.length,'Team ID collision');
const sources=table('Sources').filter(r=>/^S\d+$/.test(r.A)).map(r=>({
  id:r.A,publisher:r.B,type:r.C,coverage:r.D,checked_excel_serial:r.E??null,
  checked_date_iso:r.E?new Date(Date.UTC(1899,11,30)+Number(r.E)*86400000).toISOString().slice(0,10):null,
  url:r.F??null,notes:r.G??null,row_use:intOrNull(r.H),provenance:provenance('Sources',r)
}));
const colourSources=table('Colour Sources').filter(r=>/^C\d+$/.test(r.A)).map(r=>({
  id:r.A,reference_name:r.B,publisher:r.C,type:r.D,reference_year:r.E??null,
  url:r.F??null,distinct_team_count:intOrNull(r.G),notes:r.H??null,
  provenance:provenance('Colour Sources',r)
}));
const sourceIds=new Set(sources.map(s=>s.id)),colourIds=new Set(colourSources.map(s=>s.id));
for(const m of memberships)assert.ok(sourceIds.has(m.source_id),`Missing source ${m.source_id}`);
for(const t of teams)if(t.palette.source_id)assert.ok(colourIds.has(t.palette.source_id),`Missing colour source ${t.palette.source_id}`);
for(const c of competitions){
  const count=memberships.filter(m=>m.competition_id===c.id).length;
  assert.equal(count,c.listed_memberships,`Competition count mismatch: ${c.name}`);
  assert.equal(count,c.expected_memberships,`Expected membership mismatch: ${c.name}`);
}
// The app has country + team filters and a Home/Away switch. Other source
// metadata remains in the normalized files and never becomes an extra UI tab.
const facets={
  countries:countries.map(c=>({...c,team_count:teams.filter(t=>t.country_id===c.id).length})),
  kit_variants:['home','away']
};
// Carry the existing worksheet URLs into each task so Codex can start from them.
const sourceById=new Map(sources.map(s=>[s.id,s]));
const colourById=new Map(colourSources.map(s=>[s.id,s]));
function seedReferences(team){
  const found=new Map();
  const add=ref=>{
    if(!ref.url || !/^https?:\/\//.test(ref.url))return;
    const key=JSON.stringify([ref.purpose,ref.url]);
    if(!found.has(key))found.set(key,{...ref,provenance:[ref.provenance]});
    else found.get(key).provenance.push(ref.provenance);
  };
  for(const m of memberships.filter(m=>m.team_id===team.id)){
    const s=sourceById.get(m.source_id);
    add({purpose:'competition_membership',url:m.source_url,source_id:m.source_id,
      publisher:s?.publisher??null,evidence_type:s?.type??null,
      notes:s?.notes??null,provenance:{...m.provenance,column:'K'}});
    const paletteSource=colourById.get(team.palette.source_id);
    add({purpose:'palette_reference',url:m.imported_palette.source_url,
      source_id:team.palette.source_id,publisher:paletteSource?.publisher??null,
      evidence_type:m.imported_palette.evidence_basis,
      notes:m.imported_palette.notes,provenance:{...m.provenance,column:'P'}});
  }
  const p=team.palette,s=colourById.get(p.source_id);
  add({purpose:'palette_reference',url:p.source_url,source_id:p.source_id,
    publisher:s?.publisher??null,evidence_type:p.evidence_basis,
    notes:p.notes,provenance:{...p.provenance,column:'J'}});
  return [...found.values()];
}
// Exactly two research slots per team. Competition season labels are context,
// not proof of separate shirts. Keep all labels (notably KuPS 2026 + 2026/27).
// This file is a reproducible baseline; save work under research/results/.
const research=teams.flatMap(t=>{
  const tm=memberships.filter(m=>m.team_id===t.id);
  const sourceSeasons=[...new Set(tm.map(m=>m.season))].sort();
  const domesticSeasons=[...new Set(tm.filter(m=>m.scope==='Domestic').map(m=>m.season))];
  const candidateSeason=domesticSeasons.length===1?domesticSeasons[0]:sourceSeasons.length===1?sourceSeasons[0]:null;
  return ['home','away'].map(variant=>({
    id:id('research',t.id,variant),team_id:t.id,team_name:t.name,country_name:t.country_name,
    source_competition_seasons:sourceSeasons,candidate_kit_season:candidateSeason,
    kit_season:null,kit_variant:variant,status:'unresearched',
    reference_url:null,reference_image_url:null,local_reference_path:null,
    source_checked_at:null,config_path:null,reviewed_at:null,reviewed_by:null,
    palette_coverage:t.palette.coverage,
    assigned_to:'codex',requires_web_research:true,seed_references:seedReferences(t),research_log:[],
    research_queries:[`${t.name} ${candidateSeason??''} official ${variant} shirt`.replace(/\s+/g,' ').trim(),`${t.name} official ${variant} kit manufacturer`],
    notes:'Research this variant independently. The source season and palette are context, not verified current kit artwork or official HEX. Store progress separately from this baseline.'
  }));
});
const countBy=(items,key)=>Object.fromEntries([...new Set(items.map(key))].sort().map(k=>[k,items.filter(x=>key(x)===k).length]));
const coverage={
  source_workbook_sha256:sourceManifest.sha256,sheet_count:workbook.sheets.length,
  sheet_names:workbook.sheets.map(s=>s.name),nonempty_source_cells:workbook.sheets.reduce((n,s)=>n+s.cells.length,0),
  hyperlink_occurrences:workbook.sheets.reduce((n,s)=>n+s.hyperlinks.length,0),
  team_count:teams.length,membership_count:memberships.length,competition_count:competitions.length,
  country_or_association_count:countries.length,source_count:sources.length,colour_source_count:colourSources.length,
  membership_scope_counts:countBy(memberships,m=>m.scope),
  palette_coverage_counts:countBy(teams,t=>t.palette.coverage),
  team_type_counts:countBy(teams,t=>t.source_team_types.join(' / ')),
  hidden_all_teams_rows_preserved:sheets.get('All Teams').hidden_rows.length,
  research_task_count:research.length,research_tasks_with_seed_links:research.filter(r=>r.seed_references.length>0).length,
  requested_kit_variants:['home','away'],kit_slots_per_team:2,
  teams_with_multiple_source_seasons:teams.filter(t=>new Set(memberships.filter(m=>m.team_id===t.id).map(m=>m.season)).size>1).map(t=>t.id),
  verified_current_kits:0,
  memberships_match_every_competition:true,missing_team_ids:[],missing_membership_rows:[],
  note:'Catalog complete relative to the supplied workbook. Every team has Home and Away research slots; none is a verified kit yet.'
};
assert.equal(teams.length,735);assert.equal(memberships.length,779);assert.equal(competitions.length,27);
assert.equal(countries.length,39);assert.equal(workbook.sheets.length,16);
for(const [name,value] of Object.entries({teams,memberships,competitions,countries,sources,'colour-sources':colourSources,facets}))write(`data/normalized/${name}.json`,value);
write('data/research/kit-research-queue.json',research);
write('data/coverage-report.json',coverage);
console.log(JSON.stringify(coverage,null,2));
