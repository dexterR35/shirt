import fs from 'node:fs/promises';
import {profiles,batch,rows} from './tier1-71/shared.mjs';
import './tier1-71/england.mjs';
import './tier1-71/spain.mjs';
import './tier1-71/italy.mjs';
import './tier1-71/germany.mjs';
import './tier1-71/france.mjs';
import './tier1-71/romania-greece.mjs';
import {saveProfiles} from './fka-save-profiles.mjs';
if(profiles.length!==71||rows.length!==71)throw Error(`Expected all 71 scoped variants, got ${profiles.length}`);
const decisions=process.argv.includes('--reviewed')?JSON.parse(await fs.readFile(`data/research/${batch}-review.json`,'utf8')):[];
if(decisions.some(d=>!rows.some(r=>`${r.team}:${r.variant}`===d.key)))throw Error('Review decision outside snapshot');
if(process.argv.includes('--reviewed')&&decisions.length!==71)throw Error('Every variant needs an explicit review decision');
if(new Set(decisions.map(d=>d.key)).size!==decisions.length)throw Error('Duplicate review decision');
if(decisions.some(d=>!['ready','draft'].includes(d.status)||!d.comparison_path||!d.notes||d.status==='draft'&&!d.remaining))throw Error('Review decision needs status, comparison, notes and concrete draft gap');
for(const d of decisions)await fs.access(d.comparison_path);
for(const p of profiles){const d=decisions.find(d=>d.key===`${p.name}:${p.variant}`);if(d?.remaining)p.remaining=d.remaining;}
await saveProfiles(profiles,batch,{reviewed:decisions.filter(d=>d.status==='ready').map(d=>d.key)});
