import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {equipmentForKit} from '../src/lib/equipment.js';
import {releaseDateISO} from '../scripts/research/build-team-equipment.mjs';
import {saveProfiles} from '../scripts/research/fka-save-profiles.mjs';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));

test('all 138 workbook identities are mandatory, retain canonical IDs and lead all 1470 research slots',async()=>{
  const priority=await read('data/research/priority-teams.json'),manifest=await read('public/catalog/manifest.json');
  assert.equal(priority.team_count,138);assert.equal(priority.slot_count,276);
  assert.equal(new Set(priority.teams.map(t=>t.team_id)).size,138);
  assert.equal(crypto.createHash('sha256').update(await fs.readFile(priority.source_path)).digest('hex'),priority.source_sha256);
  assert.equal(manifest.teams.length,735);assert.equal(manifest.teams.filter(t=>t.mandatory).length,138);
  const work=await read('data/research/priority-worklist.json');
  assert.equal(work.length,1470);assert.equal(new Set(work.map(w=>w.task_id)).size,1470);
  assert.ok(work.slice(0,276).every(w=>w.mandatory&&w.requested_season==='2026/27'));
  assert.ok(work.slice(276).every(w=>!w.mandatory));
  for(const p of priority.teams){
    assert.equal(manifest.teams.find(t=>t.id===p.team_id).name,p.team_name);
    assert.equal(p.palette_status,'unverified_workbook_context_only');
    assert.deepEqual(work.filter(w=>w.team_id===p.team_id).map(w=>w.variant),['home','away']);
  }
});

test('per-team local JSON preserves archive facts and does not fill requested seasons from calendar-year kits',async()=>{
  const manifest=await read('public/catalog/manifest.json');
  let sourced=0;
  for(const team of manifest.teams){
    const saved=await read(`data/teams/${team.id}.json`),deployed=await read('public'+team.equipment_path);
    assert.deepEqual(deployed,saved);assert.equal(saved.team_name,team.name);
    for(const variant of ['home','away']){
      const kit=saved.kits[variant];
      assert.equal(kit.variant,variant);
      if(kit.source){
        if(team.mandatory){assert.equal(kit.season,'2026/27');sourced++;}
        const record=await read(kit.source.record_path);
        assert.equal(record.team_id,team.id);assert.equal(record.variant,variant);
        assert.equal(record.page_url,kit.source.url);assert.deepEqual(record.source_color_names,kit.colors);
        assert.equal(kit.color_values_official,false);
      }else{assert.equal(kit.season,null);assert.deepEqual(kit.colors,[]);assert.equal(kit.brand,null);}
      if(team.mandatory&&team.kits[variant].status==='ready')assert.equal(team.kits[variant].kit_season,'2026/27');
    }
  }
  assert.equal(sourced,manifest.counts.mandatory_references);
  const man=await read('data/teams/team_20e876bedbeb75f01389.json');
  assert.equal(man.kits.home.sponsor,'Snapdragon');assert.equal(man.kits.home.release_date_iso,'2026-05-14');
  assert.equal(man.kits.away.release_date_iso,'2026-07-22');
  assert.deepEqual(man.kits.home.competitions,['Premier League','Champions League']);
  const elche=await read('data/teams/team_4173678b78aba6c5bde9.json');
  assert.deepEqual(elche.kits.away.competitions,['Friendly'],'Competition does not exclude a mandatory team kit');
  const oulu=await read('data/teams/team_24a16861cf05897392d5.json');
  assert.equal(oulu.kits.home.source,null);assert.equal(oulu.other_season_references[0].season,'2026');
});

test('equipment cannot leak from another variant, season or unsafe source and dates are timezone-independent',async()=>{
  const kit=(await read('data/teams/team_20e876bedbeb75f01389.json')).kits.home;
  const item={variant:'home',kit_season:'2026/27'};
  assert.equal(equipmentForKit(kit,item),kit);
  assert.equal(equipmentForKit(null,item),null);
  assert.throws(()=>equipmentForKit(kit,{...item,variant:'away'}),/match/);
  assert.throws(()=>equipmentForKit(kit,{...item,kit_season:'2026'}),/match/);
  assert.throws(()=>equipmentForKit({...kit,colors:'#D32F2F'},item),/colors/);
  assert.throws(()=>equipmentForKit({...kit,source:{...kit.source,url:'javascript:alert(1)'}},item),/source/);
  assert.equal(releaseDateISO('May 14, 2026'),'2026-05-14');assert.equal(releaseDateISO(''),null);
  assert.throws(()=>releaseDateISO('February 30, 2026'));
});

test('mandatory drawing pipeline refuses a calendar-year source before writing artwork',async()=>{
  await assert.rejects(saveProfiles([{country:'Finland',name:'AC Oulu',variant:'home',make:()=>{throw Error('Should never draw a mismatched season');}}],'test-do-not-write'),/Mandatory kit requires 2026\/27/);
});

for(const size of [71,42])test(`all ${size} scoped Tier 1 variants retain independent evidence and explicit revision review gates`,async()=>{
  const batch=`tier1-${size}-2026-09-23`;
  const scope=await read(`artifacts/footballkitarchive/tier1-remaining-${size}.json`);
  const revisions=await read(`artifacts/footballkitarchive/${batch}/manifest.json`);
  const decisions=await read(`data/research/${batch}-review.json`);
  const manifest=await read('public/catalog/manifest.json');
  assert.equal(scope.length,size);assert.equal(decisions.length,size);
  assert.equal(new Set(decisions.map(d=>d.key)).size,size);
  for(const row of scope){
    const decision=decisions.find(d=>d.key===`${row.team}:${row.variant}`);
    assert.ok(decision);await fs.access(decision.comparison_path);
    const result=await read(`data/research/results/${row.task}.json`);
    const source=await read(`data/research/footballkitarchive/records/${row.task}.json`);
    const archived=revisions.find(r=>r.name===row.team&&r.variant===row.variant);
    assert.ok(archived);
    const saved=await read(archived.kit);
    const team=manifest.teams.find(t=>t.id===source.team_id),slot=team.kits[row.variant];
    assert.equal(team.mandatory,true);assert.equal(team.name,row.team);
    assert.equal(saved.research_batch,batch);assert.equal(saved.kit_season,'2026/27');
    assert.equal(saved.references[0].local_path,row.ref);
    assert.equal(saved.references[0].page_url,source.page_url);
    assert.equal(saved.status,decision.status);
    if(archived.kit!==result.kit_revision_path){
      assert.equal(size,71,'The latest batch must be the applied research revision');
      assert.equal(saved.status,'draft','A reviewed historical revision must not be replaced by this continuation');
      const successor=await read(result.kit_revision_path);
      assert.equal(successor.research_batch,'tier1-42-2026-09-23');
      assert.ok(successor.revision>saved.revision);
      continue;
    }
    assert.equal(slot.status,decision.status);
    assert.equal(slot.revision,saved.revision);
    const deployed=await read('public'+slot.details_path);
    if(decision.status==='ready'){
      assert.equal(deployed.png_layout.status,'reviewed');
      assert.equal(deployed.png_layout.research_batch,batch);
      assert.equal(deployed.visual_review.human_approved,false);
      assert.equal(deployed.equipment.source.url,source.page_url);
      assert.deepEqual(result.remaining,[]);
    }else{
      assert.equal(deployed.visual_review,null);
      assert.ok(!slot.png_layout_revision);
      assert.deepEqual(result.remaining,[decision.remaining]);
    }
  }
});

test('the 42-variant continuation preserves its predecessor and auditable local ink sources',async()=>{
  const batch='tier1-42-2026-09-23',scope=await read('artifacts/footballkitarchive/tier1-remaining-42.json');
  for(const row of scope){
    const predecessor=await read(row.previous_kit),layout=await read(row.previous_layout);
    assert.equal(predecessor.status,'draft');assert.equal(predecessor.research_batch,'tier1-71-2026-09-23');
    assert.equal(layout.status,'draft');assert.equal(layout.source_revision,predecessor.revision);
  }
  const {traces}=await read(`data/research/${batch}-traces.json`);
  for(const trace of traces){
    const row=scope.find(r=>r.team===trace.team&&r.variant===trace.variant);
    assert.equal(trace.reference,row.ref);
    assert.equal(crypto.createHash('sha256').update(await fs.readFile(trace.reference)).digest('hex'),trace.source_sha256);
    await fs.access(trace.preview);
    assert.equal(trace.box.length,4);assert.ok(trace.box.every(Number.isInteger));
    assert.ok(trace.ink_pixels>0);
  }
});
