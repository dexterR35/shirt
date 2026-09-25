import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const archive='data/research/footballkitarchive';
const identity=url=>url.match(/\/([^/]+)-((?:19|20)\d{2})(?:-(\d{2}))?-(home|away)-kit-\d+\/$/);

test('latest-equipment fallbacks retain independent identity, newest observed season and reviewed artwork',async()=>{
 const details=await read(`${archive}/observations/latest-available-details.json`);
 const histories=await read(`${archive}/observations/latest-available-histories.json`);
 const policy=await read('data/research/season-policy.json');
 assert.equal(details.length,131);assert.equal(new Set(details.map(d=>d.task_id)).size,131);
 for(const d of details){
  const selected=identity(d.url),season=selected[2]+(selected[3]?'/'+selected[3]:'');
  const history=histories.filter(h=>h.url===d.history_url||h.slots?.some(s=>s.task_id===d.task_id));
  assert.ok(history.length,d.name);
  const same=history.flatMap(h=>h.links).map(l=>identity(l.url)).filter(m=>m&&m[1]===selected[1]&&m[4]===d.variant);
  assert.ok(same.some(m=>m[0]===selected[0]),d.url);
  assert.equal(Math.max(...same.map(m=>Number(m[2]))),Number(selected[2]),`Newer ${d.name} ${d.variant} exists`);
  const source=await read(`${archive}/records/${d.task_id}.json`);
  assert.equal(source.kit_season,season);assert.equal(source.source_season_label,d.detail.fields.Season);
  assert.equal(source.team_id,d.team_id);assert.equal(source.variant,d.variant);
  assert.equal(d.detail.fields.Type.toLowerCase(),d.variant);
  assert.ok(policy.fallbacks.some(f=>f.team_id===d.team_id&&f.variant===d.variant&&f.season===season&&f.source_url===d.url&&f.history_url===d.history_url));
  const result=await read(`data/research/results/${d.task_id}.json`);
  assert.equal(result.status,'ready');assert.deepEqual(result.remaining,[]);assert.ok(!result.reason);
  const kit=await read(result.kit_revision_path),equipment=(await read(`data/teams/${d.team_id}.json`)).kits[d.variant];
  assert.equal(kit.status,'ready');assert.equal(kit.kit_season,season);assert.equal(equipment.source_season_label,d.detail.fields.Season);
  const review=(await read(`data/research/latest-available-${d.country.toLowerCase()}-2026-09-25-review.json`)).find(r=>r.key===`${d.name}:${d.variant}`);
  assert.equal(review.config_sha256,crypto.createHash('sha256').update(JSON.stringify(kit.config)).digest('hex'));
  assert.equal(review.reference_sha256,source.image_sha256);assert.equal(review.human_approved,false);
 }
 const historical=details.find(d=>d.name==='Acharnaikos'&&d.variant==='away');
 const source=await read(`${archive}/records/${historical.task_id}.json`);
 assert.equal(source.kit_season,'1983/84');assert.equal(source.source_season_label,'83-84');
});

test('latest-equipment gaps remain explicit without adopting a namesake or another variant',async()=>{
 const work=await read('data/research/latest-available-worklist.json');
 assert.equal(work.slots.length,264);assert.equal(work.counts.ready,131);assert.equal(work.counts.blocked,133);
 for(const slot of work.slots.filter(s=>s.status==='blocked')){
  const result=await read(`data/research/results/${slot.task_id}.json`);
  assert.equal(result.status,'blocked');assert.equal(result.kit_season,null);assert.ok(result.remaining.length);
  assert.ok(!result.kit_revision_path);assert.ok(slot.gap_category);
 }
 for(const name of ['Academica Recea','CS Drobeta Turnu Severin']){
  const slots=work.slots.filter(s=>s.name===name);
  assert.equal(slots.length,2);assert.ok(slots.every(s=>s.gap_category==='ambiguous_club_identity'));
 }
 const tpv=work.slots.find(s=>s.name==='TPV'&&s.variant==='away');
 assert.equal(tpv.status,'blocked');assert.equal(tpv.gap_category,'no_independent_variant');
});
