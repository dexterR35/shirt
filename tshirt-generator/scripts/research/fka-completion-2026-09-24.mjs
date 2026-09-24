import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {profiles,batch,date,out,traces,read,scope} from './tier1-completion/shared.mjs';
import './tier1-completion/finland.mjs';
import './tier1-completion/new-references.mjs';
import './tier1-completion/france.mjs';
import './tier1-completion/england-germany.mjs';
import './tier1-completion/spain-italy.mjs';
import './tier1-completion/romania-greece.mjs';
import {saveProfiles} from './fka-save-profiles.mjs';
await fs.mkdir(out,{recursive:true});
profiles.sort((a,b)=>scope.findIndex(r=>r.name===a.name&&r.variant===a.variant)-scope.findIndex(r=>r.name===b.name&&r.variant===b.variant));
const decisions=process.argv.includes('--reviewed')?await read(`data/research/${batch}-review.json`):[];
if(process.argv.includes('--reviewed')&&(decisions.length!==profiles.length||new Set(decisions.map(d=>d.key)).size!==profiles.length))throw Error('Every profile needs its own review');
for(const d of decisions){const p=profiles.find(p=>p.name+':'+p.variant===d.key);if(!p||!['ready','draft'].includes(d.status)||!d.notes||!d.comparison_path||d.status==='draft'&&!d.remaining)throw Error('Invalid review');await fs.access(d.comparison_path);if(d.config_sha256!==crypto.createHash('sha256').update(JSON.stringify(p.make())).digest('hex'))throw Error(`Stale visual review: ${d.key}`);p.remaining=d.remaining;}
await fs.writeFile(`data/research/${batch}-traces.json`,JSON.stringify({batch,date,traces},null,2)+'\n');
await saveProfiles(profiles,batch,{date,reviewed:decisions.filter(d=>d.status==='ready').map(d=>d.key)});
