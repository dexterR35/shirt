import fs from 'node:fs/promises';
import {profiles,batch,rows} from './tier1-42/shared.mjs';
import {traces} from './tier1-42/ink.mjs';
import {saveProfiles} from './fka-save-profiles.mjs';
// Sequential imports make profile order and crop provenance reproducible.
for(const country of ['england','spain','italy','germany','france','romania-greece'])await import(`./tier1-42/${country}.mjs`);
if(profiles.length!==42||rows.length!==42)throw Error('Expected every one of the 42 scoped variants');
const decisions=process.argv.includes('--reviewed')?JSON.parse(await fs.readFile(`data/research/${batch}-review.json`,'utf8')):[];
if(process.argv.includes('--reviewed')&&decisions.length!==42)throw Error('Every variant needs an explicit review decision');
if(new Set(decisions.map(d=>d.key)).size!==decisions.length)throw Error('Duplicate review decision');
for(const d of decisions){
  if(!rows.some(r=>r.key===d.key)||!['ready','draft'].includes(d.status)||!d.notes||!d.comparison_path||d.status==='draft'&&!d.remaining)throw Error('Incomplete review decision');
  await fs.access(d.comparison_path);
}
for(const p of profiles){const d=decisions.find(d=>d.key===`${p.name}:${p.variant}`);if(d?.remaining)p.remaining=d.remaining;}
await fs.writeFile(`data/research/${batch}-traces.json`,JSON.stringify({batch,date:'2026-09-23',traces},null,2)+'\n');
await saveProfiles(profiles,batch,{reviewed:decisions.filter(d=>d.status==='ready').map(d=>d.key)});
