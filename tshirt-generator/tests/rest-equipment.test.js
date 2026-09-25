import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {canonicalSeason} from '../scripts/research/fka-import.mjs';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const root='data/research/footballkitarchive';

test('remaining 123 shirts preserve independently selected sources, event labels and exact equipment facts',async()=>{
 const details=await read(`${root}/observations/rest-details.json`),histories=await read(`${root}/observations/rest-histories.json`),policy=await read('data/research/season-policy.json');
 assert.equal(details.length,123);assert.equal(new Set(details.map(d=>d.task_id)).size,123);assert.equal(histories.length,62);
 for(const d of details){
  const history=histories.find(h=>h.team_id===d.team_id),source=await read(`${root}/records/${d.task_id}.json`),f=d.detail.fields;
  assert.ok(history.links.some(l=>l.url===d.url),d.name);assert.ok(d.detail.team_history.includes(history.url));
  assert.match(f.Type,new RegExp(`^(?:(?:Champions|Europa|Conference) League )?${d.variant}(?: V2)?$`,'i'));
  const prefix=d.url.match(/\/([^/]+?)-20\d{2}(?:-\d{2})?-/)[1];
  const candidatePattern=new RegExp(`/${prefix}-(20\\d{2})(?:-(\\d{2}))?-(?:(?:champions|europa|conference)-league-)?${d.variant}(?:-v2)?-kit-\\d+/$`);
  const ranks=history.links.map(l=>candidatePattern.exec(l.url)).filter(Boolean).map(m=>Number(m[1])*10+Number(!!m[2]));
  assert.equal(Math.max(...ranks),d.rank,`Newer observed variant: ${d.name} ${d.variant}`);
  assert.equal(source.team_id,d.team_id);assert.equal(source.variant,d.variant);assert.equal(source.page_url,d.url);
  assert.equal(source.image_url,d.detail.images[0]);assert.equal(source.source_season_label,f.Season);assert.equal(source.kit_season,canonicalSeason(f.Season));
  assert.equal(source.image_sha256,sha(await fs.readFile(source.local_reference_path)));
  const equipment=(await read(`data/teams/${d.team_id}.json`)).kits[d.variant];
  assert.equal(equipment.type,f.Type);assert.equal(equipment.source_season_label,f.Season);
  assert.equal(equipment.sponsor,f.Sponsor||null);assert.equal(equipment.release_date,f['Release date']||null);
  assert.deepEqual(equipment.competitions,(f.Competitions||'').split('\n').filter(Boolean));
  if(source.kit_season!=='2026/27')assert.ok(policy.fallbacks.some(p=>p.team_id===d.team_id&&p.variant===d.variant&&p.season===source.kit_season&&p.source_url===d.url&&p.history_url===history.url));
  const result=await read(`data/research/results/${d.task_id}.json`),kit=await read(result.kit_revision_path);
  assert.equal(result.status,'ready');assert.deepEqual(result.remaining,[]);assert.ok(!result.reason);
  const review=(await read(`data/research/${kit.research_batch}-review.json`)).find(r=>r.key===`${d.name}:${d.variant}`);
  assert.equal(review.config_sha256,sha(JSON.stringify(kit.config)));assert.equal(review.reference_sha256,source.image_sha256);
  assert.equal(review.status,'ready');assert.equal(review.human_approved,false);await fs.access(review.comparison_path);
  const published=await read(`public/catalog/kits/${d.team_id}-${d.variant}-${kit.revision}.json`);
  assert.equal(published.status,'ready');assert.equal(published.png_layout.status,'reviewed');assert.equal(published.equipment.type,f.Type);
 }
 const work=await read('data/research/rest-worklist.json');
 assert.deepEqual(work.counts,{teams:62,slots:123,ready:123,blocked:0,researching:0,draft:0});
 assert.deepEqual(work.seasons,{'2025/26':1,'2026':15,'2026/27':107});
});

test('rest continuation preserves every previous ready config and leaves only the 133 documented gaps',async()=>{
 const baseline=await read('artifacts/footballkitarchive/rest-2026-09-25/baseline-locks.json'),locks=await read('data/kit-config-lock.json');
 for(const [file,hash]of Object.entries(baseline)){
  const kit=await read(`data/kits/${file}`);assert.equal(kit.status,'ready');assert.equal(sha(JSON.stringify(kit.config)),hash,file);assert.equal(locks[file],hash);
 }
 const manifest=await read('public/catalog/manifest.json'),slots=manifest.teams.flatMap(t=>Object.values(t.kits));
 assert.equal(slots.length,1470);assert.equal(slots.filter(s=>s.status==='ready').length,1337);assert.equal(slots.filter(s=>s.status==='blocked').length,133);
 assert.ok(slots.every(s=>['ready','blocked'].includes(s.status)));
});
