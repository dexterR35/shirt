import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {parseCapture,matchTeam} from '../scripts/research/fka-import.mjs';

const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');

test('Tier 3 worklist preserves workbook membership and independent Home/Away progress',async()=>{
  const memberships=await read('data/normalized/memberships.json');
  const scope=memberships.filter(m=>m.scope==='Domestic'&&m.tier===3);
  const ids=new Set(scope.map(m=>m.team_id));
  const work=await read('data/research/tier3-worklist.json');
  assert.equal(ids.size,383);assert.equal(work.tasks.length,766);
  assert.deepEqual(new Set(work.tasks.map(t=>t.team_id)),ids);
  assert.equal(new Set(work.tasks.map(t=>t.task_id)).size,766);
  for(const id of ids)assert.deepEqual(work.tasks.filter(t=>t.team_id===id).map(t=>t.variant).sort(),['away','home']);
  for(const task of work.tasks){
    const result=await read(`data/research/results/${task.task_id}.json`);
    assert.equal(task.status,result.status);assert.deepEqual(task.remaining,result.remaining??[]);
    assert.deepEqual(task.membership_ids,scope.filter(m=>m.team_id===task.team_id).map(m=>m.id));
  }
  for(const [status,count] of Object.entries(work.counts))assert.equal(count,work.tasks.filter(t=>t.status===status).length);
});

test('League One first batch binds reviewed paint, independent evidence and equipment to all 16 published slots',async()=>{
  const batch='tier3-england-a-2026-09-24';
  const manifest=await read(`artifacts/footballkitarchive/${batch}/manifest.json`);
  const decisions=await read(`data/research/${batch}-review.json`);
  const catalog=await read('public/catalog/manifest.json');
  const teams=await read('data/normalized/teams.json');
  const root='data/research/footballkitarchive/captures/league-one-a-2026-27';
  const capture=await read(root+'.json'),rows=parseCapture(await fs.readFile(root+'.tsv','utf8'));
  assert.equal(manifest.length,16);assert.equal(decisions.length,16);assert.equal(rows.length,16);
  assert.equal(new Set(rows.map(r=>r.kit_id)).size,16);
  for(const item of manifest){
    const k=await read(item.kit),layout=await read(item.layout);
    const d=decisions.find(d=>d.key===`${item.name}:${item.variant}`);
    assert.equal(k.status,'ready');assert.equal(d.status,'ready');assert.equal(layout.status,'reviewed');
    assert.equal(k.kit_season,'2026/27');assert.equal(k.visual_review.human_approved,false);
    assert.equal(d.config_sha256,hash(JSON.stringify(k.config)));
    assert.equal(d.reference_sha256,hash(await fs.readFile(item.reference)));await fs.access(d.comparison_path);
    const slot=catalog.teams.find(t=>t.id===k.team_id).kits[k.variant];
    assert.equal(slot.status,'ready');assert.equal(slot.revision,k.revision);assert.equal(slot.png_layout_revision,layout.layout_revision);
    const published=await read('public'+slot.details_path);assert.deepEqual(published.png_layout.config,k.config);
    const row=rows.find(r=>matchTeam(capture.team_aliases[r.team]??r.team,'England',teams)?.id===k.team_id&&r.variant.toLowerCase()===k.variant);
    assert.ok(row);assert.equal(k.references[0].page_url,`https://www.footballkitarchive.com/${row.kit_slug}-kit-${row.kit_id}/`);
    const equipment=(await read(`data/teams/${k.team_id}.json`)).kits[k.variant];
    assert.equal(equipment.brand,row.brand);assert.equal(equipment.sponsor,row.sponsor||null);
    assert.equal(equipment.release_date,row.release_date||null);assert.equal(equipment.source.extended_fields_capture,root+'.tsv');
    assert.deepEqual(equipment.competitions,['League One']);
  }
});

test('every ready Tier 3 slot publishes its individually reviewed configuration and literal source season',async()=>{
  const work=await read('data/research/tier3-worklist.json'),catalog=await read('public/catalog/manifest.json');
  const reviews=new Map();
  for(const task of work.tasks.filter(t=>t.status==='ready')){
    const k=await read(task.kit_revision_path),source=await read(`data/research/footballkitarchive/records/${task.task_id}.json`);
    if(!reviews.has(k.research_batch))reviews.set(k.research_batch,await read(`data/research/${k.research_batch}-review.json`));
    const decision=reviews.get(k.research_batch).find(d=>d.key===`${k.team_name}:${k.variant}`);
    assert.equal(decision?.status,'ready',task.team_name);
    assert.equal(decision.config_sha256,hash(JSON.stringify(k.config)));
    assert.equal(decision.reference_sha256,hash(await fs.readFile(task.reference_path)));
    assert.equal(k.kit_season,source.kit_season);assert.equal(k.variant,task.variant);assert.equal(k.team_id,task.team_id);
    assert.equal(k.visual_review.human_approved,false);await fs.access(decision.comparison_path);
    const slot=catalog.teams.find(t=>t.id===task.team_id).kits[task.variant];
    assert.equal(slot.status,'ready');assert.equal(slot.revision,k.revision);assert.equal(slot.kit_season,k.kit_season);
    const published=await read('public'+slot.details_path);assert.deepEqual(published.png_layout.config,k.config);
    const equipment=(await read(`data/teams/${task.team_id}.json`)).kits[task.variant];
    assert.equal(equipment.season,k.kit_season);assert.equal(equipment.source.url,task.source_url);
  }
  const pro=(await read('data/teams/team_01574f84fc27a53ae442.json')).kits.away;
  assert.equal(pro.release_date,'August 15, 225');assert.equal(pro.release_date_iso,null);
});
