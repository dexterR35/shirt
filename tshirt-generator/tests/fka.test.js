import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {matchTeam,parseCapture,discoveryCandidates,canonicalSeason} from '../scripts/research/fka-import.mjs';
import crypto from 'node:crypto';
import {parseKitHtml} from '../scripts/research/fka-scrape.mjs';

test('archive identity matching preserves country, reserve identity and ambiguous names',()=>{
  const teams=[{id:'a',name:'Arsenal',country_name:'England'},{id:'b',name:'Arsenal',country_name:'Argentina'},{id:'c',name:'Arsenal II',country_name:'England'}];
  assert.equal(matchTeam('Arsenal FC','England',teams).id,'a');
  assert.equal(matchTeam('Arsenal II','England',teams).id,'c');
  assert.equal(matchTeam('Arsenal','Spain',teams),null);
  assert.equal(matchTeam('Arsenal','England',[...teams,{...teams[0],id:'d'}]),null);
});
test('source captures keep independent Home/Away evidence without promoting scraped rows',async()=>{
  const rows=parseCapture(await fs.readFile('data/research/footballkitarchive/captures/premier-league-2026-27.tsv','utf8'));
  assert.equal(rows.length,40);
  assert.equal(new Set(rows.map(r=>r.kit_id)).size,40);
  for(const name of new Set(rows.map(r=>r.team)))assert.deepEqual(rows.filter(r=>r.team===name).map(r=>r.variant).sort(),['Away','Home']);
  const work=JSON.parse(await fs.readFile('data/research/footballkitarchive/worklist.json','utf8'));
  assert.equal(work.length,1470);assert.equal(new Set(work.map(r=>r.task_id)).size,1470);
});
test('scraper rejects challenges and non-outfield slots and keeps search hits unverified',()=>{
  assert.throws(()=>parseKitHtml('<title>Just a moment...</title>','https://www.footballkitarchive.com/'),/verification/);
  const html='<h1>Arsenal FC 2026-27 Home Kit</h1><table><tr><td>Team</td><td><a>Arsenal FC</a></td></tr><tr><td>Season</td><td>26-27</td></tr><tr><td>Type</td><td>Home</td></tr></table><a href="/cdn/2026/01/01/abc/arsenal-home.jpg"><img></a>';
  assert.equal(parseKitHtml(html,'https://www.footballkitarchive.com/a/').fields.Type,'Home');
  assert.throws(()=>parseKitHtml(html.replace('<td>Home</td>','<td>GK Home</td>'),'https://www.footballkitarchive.com/a/'));
  const hits=discoveryCandidates('Arsenal FC 2026-27 Home Kit (https://www.footballkitarchive.com/arsenal-home-kit-123/)\nArsenal II Kit History (https://www.footballkitarchive.com/arsenal-ii-kits/)','Arsenal');
  assert.equal(hits.length,1);assert.ok(!hits[0].verified);
});

test('archive carry-over seasons are explicit while unknown labels are not guessed',()=>{
  assert.equal(canonicalSeason('26-27 (Carry-over)'),'2026/27');
  assert.equal(canonicalSeason('26-27'),'2026/27');
  assert.equal(canonicalSeason('2026'),'2026');
  assert.equal(canonicalSeason('2026 (Carry-over)'),'2026');
  assert.equal(canonicalSeason('26-27 (Rumour)'),'26-27 (Rumour)');
});

test('every country capture resolves unique workbook slots with independent intact source images',async()=>{
  const root='data/research/footballkitarchive',teams=JSON.parse(await fs.readFile('data/normalized/teams.json','utf8'));
  const queue=JSON.parse(await fs.readFile('data/research/kit-research-queue.json','utf8'));
  const seen=new Set();
  for(const file of (await fs.readdir(`${root}/captures`)).filter(f=>f.endsWith('.json'))){
    const capture=JSON.parse(await fs.readFile(`${root}/captures/${file}`,'utf8'));
    const rows=parseCapture(await fs.readFile(`${root}/captures/${capture.capture_file}`,'utf8'));
    assert.equal(rows.length,capture.record_count,file);
    for(const row of rows){
      const team=matchTeam(capture.team_aliases?.[row.team]||row.team,capture.country,teams);
      assert.ok(team,`${file}: ${row.team}`);
      const task=queue.find(q=>q.team_id===team.id&&q.kit_variant===row.variant.toLowerCase());
      assert.equal(canonicalSeason(row.season),task.candidate_kit_season);
      assert.ok(!seen.has(task.id),`Duplicate source task ${task.id}`);seen.add(task.id);
      const record=JSON.parse(await fs.readFile(`${root}/records/${task.id}.json`,'utf8'));
      assert.equal(record.source_season_label,row.season);
      assert.equal(record.source_kit_id,row.kit_id);
      assert.equal(record.team_id,team.id);
      const hash=crypto.createHash('sha256').update(await fs.readFile(record.local_reference_path)).digest('hex');
      assert.equal(hash,record.image_sha256);
      if(record.status==='artwork_reviewed'){
        const revision=JSON.parse(await fs.readFile(record.artwork_revision_path,'utf8'));
        assert.equal(revision.status,'ready');assert.equal(revision.variant,record.variant);
        assert.equal(revision.visual_review.human_approved,false);
        await fs.access(record.visual_review.render_path);
      }
    }
  }
  const progress=JSON.parse(await fs.readFile(`${root}/progress.json`,'utf8'));
  assert.equal(seen.size,progress.references_saved);assert.deepEqual(progress.unmatched,[]);
});
