import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {equipmentForKit} from '../src/lib/equipment.js';
import {releaseDateISO} from '../scripts/research/build-team-equipment.mjs';
import {permittedSeason,fallbackFor,seasonPolicy} from '../scripts/research/season-policy.mjs';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));

test('Tier 1 is complete with individually reviewed local revisions and literal fallback seasons',async()=>{
  const batch='tier1-completion-2026-09-24',manifest=await read('public/catalog/manifest.json');
  const mandatory=manifest.teams.filter(t=>t.mandatory),slots=mandatory.flatMap(t=>Object.values(t.kits));
  assert.equal(slots.length,276);assert.ok(slots.every(k=>k.status==='ready'&&k.png_layout_revision));
  assert.equal(slots.filter(k=>k.kit_season==='2026/27').length,251);
  assert.equal(slots.filter(k=>k.kit_season==='2026').length,24);
  assert.equal(slots.filter(k=>k.kit_season==='2025/26').length,1);
  const scope=await read(`data/research/${batch}-scope.json`),decisions=await read(`data/research/${batch}-review.json`);
  const revisions=await read(`artifacts/footballkitarchive/${batch}/manifest.json`);
  assert.equal(scope.length,43);assert.equal(decisions.length,43);assert.equal(new Set(decisions.map(d=>d.key)).size,43);
  for(const row of scope){
    const item=revisions.find(r=>r.name===row.name&&r.variant===row.variant),k=await read(item.kit),l=await read(item.layout);
    const d=decisions.find(d=>d.key===`${row.name}:${row.variant}`),team=mandatory.find(t=>t.id===k.team_id),slot=team.kits[row.variant];
    assert.equal(d.status,'ready');assert.ok(d.notes&&d.limitations);await fs.access(d.comparison_path);
    assert.equal(d.config_sha256,crypto.createHash('sha256').update(JSON.stringify(k.config)).digest('hex'));
    assert.equal(slot.revision,k.revision);assert.equal(slot.png_layout_revision,l.layout_revision);
    const published=await read('public'+slot.details_path),result=await read(`data/research/results/${row.task}.json`);
    assert.equal(published.equipment.season,k.kit_season);assert.equal(published.png_layout.status,'reviewed');
    assert.equal(published.visual_review.human_approved,false);assert.deepEqual(result.remaining,[]);
    assert.equal(k.references[0].local_path,row.ref);
    if(row.kit){const old=await read(row.kit);assert.equal(old.status,'draft');assert.ok(k.revision>old.revision);}
  }
  const petrolul=await read('data/teams/team_681ab3aa19bea70aa273.json');
  assert.equal(petrolul.kits.away.season,'2025/26');assert.equal(petrolul.kits.away.sponsor,'MrBit');
  const sociedad=await read('data/teams/team_909183a07cf516b052d2.json');
  for(const k of Object.values(sociedad.kits)){assert.match(k.source_issue.outcome,/404/);assert.match(k.source.evidence_url,/la-liga-kits-2026-27/);assert.equal(k.sponsor,null);}
});

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
  const {names:corrected}=await read('data/team-display-names.json');
  for(const p of priority.teams){
    // The workbook name is shown unless a documented display-name correction exists; then it stays an alias.
    const shown=manifest.teams.find(t=>t.id===p.team_id),fix=corrected[p.team_id];
    if(fix){assert.equal(fix.source_name,p.team_name);assert.equal(shown.name,fix.name);assert.ok(shown.aliases.includes(p.team_name));}
    else assert.equal(shown.name,p.team_name);
    assert.equal(p.palette_status,'unverified_workbook_context_only');
    assert.deepEqual(work.filter(w=>w.team_id===p.team_id).map(w=>w.variant),['home','away']);
  }
});

test('per-team local JSON preserves literal archive seasons and explicit fallback provenance',async()=>{
  const manifest=await read('public/catalog/manifest.json');
  let sourced=0;
  for(const team of manifest.teams){
    const saved=await read(`data/teams/${team.id}.json`),deployed=await read('public'+team.equipment_path);
    assert.deepEqual(deployed,saved);assert.equal(saved.team_name,team.name);
    for(const variant of ['home','away']){
      const kit=saved.kits[variant];
      assert.equal(kit.variant,variant);
      if(kit.source){
        if(team.mandatory){assert.ok(permittedSeason(team.id,variant,kit.season));assert.deepEqual(kit.season_fallback,fallbackFor(team.id,variant,kit.season));sourced++;}
        const record=await read(kit.source.record_path);
        assert.equal(record.team_id,team.id);assert.equal(record.variant,variant);
        assert.equal(record.page_url,kit.source.url);assert.deepEqual(record.source_color_names,kit.colors);
        assert.equal(kit.color_values_official,false);
      }else{assert.equal(kit.season,null);assert.deepEqual(kit.colors,[]);assert.equal(kit.brand,null);}
      if(team.mandatory&&team.kits[variant].status==='ready')assert.equal(team.kits[variant].kit_season,kit.season);
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
  assert.equal(oulu.kits.home.season,'2026');assert.ok(oulu.kits.home.source);assert.equal(oulu.other_season_references.length,0);
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
  assert.equal(releaseDateISO('February 30, 2026'),null);
  assert.equal(releaseDateISO('August 15, 225'),null);
  assert.equal(releaseDateISO('February 29, 2024'),'2024-02-29');
  assert.equal(releaseDateISO('February 29, 2025'),null);
  assert.equal(releaseDateISO('January 0, 2026'),null);
});

test('season fallback is restricted to audited team, variant and literal season',async()=>{
  const priority=await read('data/research/priority-teams.json');
  const mandatoryIds=new Set(priority.teams.map(t=>t.team_id));
  assert.equal(seasonPolicy.fallbacks.filter(f=>mandatoryIds.has(f.team_id)).length,25);
  const keys=seasonPolicy.fallbacks.map(f=>`${f.team_id}:${f.variant}:${f.season}`);
  assert.equal(new Set(keys).size,keys.length);
  for(const fallback of seasonPolicy.fallbacks){
    assert.ok(['home','away'].includes(fallback.variant));
    assert.ok(fallback.reason);
    assert.match(fallback.source_url,/^https:\/\/www\.footballkitarchive\.com\/.+/);
    assert.equal(permittedSeason(fallback.team_id,fallback.variant,fallback.season),true);
    assert.equal(permittedSeason('unknown-team',fallback.variant,fallback.season),false);
  }
  assert.equal(permittedSeason('team_24a16861cf05897392d5','home','2026'),true);
  assert.equal(permittedSeason('team_24a16861cf05897392d5','home','2025/26'),false);
  assert.equal(permittedSeason('team_20e876bedbeb75f01389','home','2026'),false);
  assert.equal(permittedSeason('team_681ab3aa19bea70aa273','away','2025/26'),true);
  assert.equal(permittedSeason('team_681ab3aa19bea70aa273','home','2025/26'),false);
  assert.equal(permittedSeason('team_681ab3aa19bea70aa273','away','2026/27'),true);
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
      assert.equal(saved.status,'draft','A reviewed historical revision must not be replaced by this continuation');
      const successor=await read(result.kit_revision_path);
      if(successor.research_batch==='tier1-completion-2026-09-24'){
        const nextScope=await read(`data/research/${successor.research_batch}-scope.json`);
        const lineage=nextScope.find(r=>r.name===row.team&&r.variant===row.variant);
        assert.ok(lineage?.kit);const predecessor=await read(lineage.kit);
        assert.equal(predecessor.status,'draft');assert.equal(predecessor.team_id,saved.team_id);
        assert.ok(predecessor.revision>=saved.revision);assert.equal(successor.status,'ready');
      }else if(['tier1-refinement-2026-09-24','tier1-ornaments-2026-09-24'].includes(successor.research_batch)){
        const nextScope=await read(`data/research/${successor.research_batch}-scope.json`);
        const lineage=nextScope.find(r=>r.name===row.team&&r.variant===row.variant);
        assert.ok(lineage,'The successor must belong to the explicit continuation scope');
        const previous=await read(lineage.previous_kit);
        assert.equal(previous.research_batch,'tier1-42-2026-09-23');
        assert.equal(previous.status,'draft');
        if(size===42)assert.equal(lineage.previous_kit,archived.kit);
      }else{
        assert.equal(size,71);
        assert.equal(successor.research_batch,'tier1-42-2026-09-23');
      }
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

for(const [batch,count,readyKeys] of [
  ['tier1-refinement-2026-09-24',4,['Union Berlin:home','Toulouse:away']],
  ['tier1-ornaments-2026-09-24',3,['Milan:away','Venezia:away']],
])test(`${batch} retains predecessors and activates only reviewed exact-season variants`,async()=>{
  const scope=await read(`data/research/${batch}-scope.json`),decisions=await read(`data/research/${batch}-review.json`);
  const revisions=await read(`artifacts/footballkitarchive/${batch}/manifest.json`);
  const manifest=await read('public/catalog/manifest.json');
  assert.equal(scope.length,count);assert.equal(revisions.length,count);assert.equal(decisions.length,count);
  assert.deepEqual(decisions.filter(d=>d.status==='ready').map(d=>d.key),readyKeys);
  for(const row of scope){
    const previous=await read(row.previous_kit),oldLayout=await read(row.previous_layout);
    assert.equal(previous.status,'draft');assert.equal(oldLayout.status,'draft');
    const item=revisions.find(r=>r.name===row.name&&r.variant===row.variant),k=await read(item.kit),layout=await read(item.layout);
    const decision=decisions.find(d=>d.key===`${row.name}:${row.variant}`);
    assert.ok(k.revision>previous.revision);assert.equal(k.status,decision.status);
    assert.equal(k.kit_season,'2026/27');assert.equal(k.references[0].page_url,row.source_url);
    assert.equal(k.references[0].local_path,row.reference);await fs.access(decision.comparison_path);
    const team=manifest.teams.find(t=>t.id===k.team_id),slot=team.kits[k.variant];
    assert.equal(team.mandatory,true);
    if(slot.revision!==k.revision){
      assert.equal(k.status,'draft');assert.ok(decision.remaining);
      const next=await read('public'+slot.details_path);assert.equal(next.research_batch,'tier1-completion-2026-09-24');
      const scope=await read('data/research/tier1-completion-2026-09-24-scope.json');
      assert.equal(scope.find(r=>r.name===row.name&&r.variant===row.variant).kit,item.kit);
      assert.equal(slot.status,'ready');continue;
    }
    assert.equal(slot.status,k.status);
    const deployed=await read('public'+slot.details_path);
    if(k.status==='ready'){
      assert.equal(k.visual_review.reviewed_at,'2026-09-24');assert.equal(layout.status,'reviewed');
      assert.equal(deployed.png_layout.layout_revision,layout.layout_revision);
      assert.equal(deployed.equipment.source.url,row.source_url);
    }else{assert.ok(decision.remaining);assert.equal(k.visual_review,null);assert.ok(!slot.png_layout_revision);}
  }
  const {traces}=await read(`data/research/${batch}-traces.json`);
  assert.equal(traces.length,batch.includes('ornaments')?2:4);
  for(const t of traces){
    assert.equal(crypto.createHash('sha256').update(await fs.readFile(t.reference)).digest('hex'),t.source_sha256);
    assert.ok(t.ink_pixels>0);
    if(batch.includes('refinement'))assert.equal(t.team,'Bayer Leverkusen');
    if(t.team==='Lorient'){assert.equal(t.used_in_final,false);assert.ok(t.rejection);}
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
