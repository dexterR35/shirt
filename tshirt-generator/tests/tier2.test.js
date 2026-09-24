import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {parseCapture,matchTeam} from '../scripts/research/fka-import.mjs';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');

test('Tier 2 inventory retains all 150 workbook identities and 300 independent slots',async()=>{
 const memberships=await read('data/normalized/memberships.json'),work=await read('data/research/tier2-worklist.json');
 const scope=memberships.filter(m=>m.scope==='Domestic'&&m.tier===2),ids=new Set(scope.map(m=>m.team_id));
 assert.equal(ids.size,150);assert.equal(work.team_count,150);assert.equal(work.tasks.length,300);
 assert.equal(new Set(work.tasks.map(t=>t.task_id)).size,300);
 assert.deepEqual(new Set(work.tasks.map(t=>t.team_id)),ids);
 for(const id of ids)assert.deepEqual(work.tasks.filter(t=>t.team_id===id).map(t=>t.variant).sort(),['away','home']);
 for(const row of work.tasks){
  assert.deepEqual(row.membership_ids,scope.filter(m=>m.team_id===row.team_id).map(m=>m.id));
  const result=await read(`data/research/results/${row.task_id}.json`);
  assert.equal(row.status,result.status);assert.deepEqual(row.remaining,result.remaining??[]);
 }
 for(const [status,count]of Object.entries(work.counts))assert.equal(count,work.tasks.filter(t=>t.status===status).length);
 assert.equal(work.references_saved,work.tasks.filter(t=>t.reference_path).length);
});

for(const [country,count,ready]of [['england',48,41],['germany',36,25],['romania',23,11],['italy',26,26]]){
 test(`Tier 2 ${country} activates only individually reviewed exact configurations`,async()=>{
  const batch=`tier2-${country}-2026-09-24`,decisions=await read(`data/research/${batch}-review.json`);
  const manifest=await read(`artifacts/footballkitarchive/${batch}/manifest.json`),catalog=await read('public/catalog/manifest.json');
  assert.equal(manifest.length,count);assert.equal(decisions.length,count);assert.equal(new Set(decisions.map(d=>d.key)).size,count);
  assert.equal(decisions.filter(d=>d.status==='ready').length,ready);
  for(const item of manifest){
   const k=await read(item.kit),l=await read(item.layout),d=decisions.find(d=>d.key===`${item.name}:${item.variant}`);
   assert.ok(d?.notes);assert.equal(d.config_sha256,hash(JSON.stringify(k.config)));assert.equal(d.reference_sha256,hash(await fs.readFile(item.reference)));
   await fs.access(d.comparison_path);assert.equal(k.status,d.status);assert.equal(k.kit_season,'2026/27');
   assert.deepEqual(l.config,k.config);assert.equal(l.references[0].local_path,item.reference);
   const team=catalog.teams.find(t=>t.id===k.team_id),slot=team.kits[k.variant];
   assert.equal(team.mandatory,false);
   if(slot.revision!==k.revision){
    assert.equal(d.status,'draft');assert.equal(slot.status,'ready');
    const successors=await read(`data/research/tier2-refine-${country}-2026-09-24-scope.json`);
    assert.ok(successors.some(s=>s.key===d.key&&s.previous_kit===item.kit));
   }else assert.equal(slot.status,d.status);
   const published=await read('public'+slot.details_path);
   if(d.status==='ready'){
    assert.equal(l.status,'reviewed');assert.equal(slot.png_layout_revision,l.layout_revision);
    assert.equal(k.visual_review.human_approved,false);assert.equal(published.png_layout.status,'reviewed');
   }else{
    assert.ok(d.remaining);assert.equal(l.status,'draft');assert.equal(k.visual_review,null);
    if(slot.revision===k.revision)assert.ok(!slot.png_layout_revision);
   }
  }
 });
}

for(const [batch,count]of [['tier2-refine-england-2026-09-24',7],['tier2-refine-germany-2026-09-24',11],['tier2-refine-romania-2026-09-24',12],['tier2-italy-complete-2026-09-24',14],['tier2-romania-gap-2026-09-24',1],['tier2-france-2026-09-24',36]]){
 test(`${batch} publishes the individually compared immutable paint`,async()=>{
  const decisions=await read(`data/research/${batch}-review.json`),manifest=await read(`artifacts/footballkitarchive/${batch}/manifest.json`),catalog=await read('public/catalog/manifest.json');
  assert.equal(decisions.length,count);assert.equal(manifest.length,count);
  for(const item of manifest){
   const k=await read(item.kit),l=await read(item.layout),d=decisions.find(d=>d.key===`${item.name}:${item.variant}`);
   assert.equal(k.status,'ready');assert.equal(d.status,'ready');assert.equal(l.status,'reviewed');
   assert.equal(d.config_sha256,hash(JSON.stringify(k.config)));assert.deepEqual(l.config,k.config);
   assert.equal(d.reference_sha256,hash(await fs.readFile(item.reference)));await fs.access(d.comparison_path);
   assert.equal(k.visual_review.human_approved,false);assert.equal(k.kit_season,'2026/27');
   const slot=catalog.teams.find(t=>t.id===k.team_id).kits[k.variant];
   assert.equal(slot.revision,k.revision);assert.equal(slot.png_layout_revision,l.layout_revision);assert.equal(slot.status,'ready');
   const details=await read('public'+slot.details_path);assert.deepEqual(details.png_layout.config,k.config);
  }
 });
}

test('Tier 2 equipment fields use their own per-page capture, including explicit missing values',async()=>{
 const teams=await read('data/normalized/teams.json'),queue=await read('data/research/kit-research-queue.json');
 for(const [captureName,count]of [['championship-2026-27',48],['2-bundesliga-2026-27',36],['serie-b-2026-27',40],['ligue-2-2026-27',36]]){
  const path=`data/research/footballkitarchive/captures/${captureName}`,capture=await read(path+'.json');
  const rows=parseCapture(await fs.readFile(path+'.tsv','utf8'));assert.equal(rows.length,count);
  assert.equal(new Set(rows.map(r=>r.kit_id)).size,count);
  for(const row of rows){
   const team=matchTeam(capture.team_aliases[row.team]??row.team,capture.country,teams);
   const variant=row.variant.toLowerCase(),task=queue.find(q=>q.team_id===team.id&&q.kit_variant===variant);
   const record=await read(`data/research/footballkitarchive/records/${task.id}.json`),saved=(await read(`data/teams/${team.id}.json`)).kits[variant];
   assert.equal(record.equipment_fields.sponsor,row.sponsor||null);assert.equal(saved.sponsor,row.sponsor||null);
   assert.equal(saved.source.extended_fields_capture,path+'.tsv');assert.equal(saved.source.extended_fields_checked_at,'2026-09-24');
   assert.equal(saved.release_date,row.release_date||null);assert.equal(saved.source_season_label,row.season);
   assert.deepEqual(saved.competitions,row.competitions?row.competitions.split(' | '):[]);
  }
 }
});
