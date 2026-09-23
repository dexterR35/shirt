import fs from 'node:fs/promises';
export {base,neck,cuffs,shoulderBands,sidePiping,path,rect,poly} from '../png-paint-helpers.mjs';
export {line,hatch,n,mirror,circle,gradient,network} from '../tier1-71/shared.mjs';
export const batch='tier1-42-2026-09-23';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const prior=await read('artifacts/footballkitarchive/tier1-71-2026-09-23/manifest.json');
const scope=await read('artifacts/footballkitarchive/tier1-remaining-71.json');
export const rows=[];
for(const p of prior.filter(p=>p.status==='draft')){
  const kit=await read(p.kit),s=scope.find(r=>r.team===p.name&&r.variant===p.variant);
  rows.push({...s,key:p.name+':'+p.variant,previous_kit:p.kit,previous_layout:p.layout,config:kit.config,observations:kit.observations});
}
if(rows.length!==42)throw Error('Expected fixed 42-variant continuation scope');
export const profiles=[];
export function previous(name,variant){return structuredClone(rows.find(r=>r.key===name+':'+variant).config);}
export function source(name,variant){return rows.find(r=>r.key===name+':'+variant).ref;}
export function add(name,variant,config,observations,remaining){
  const r=rows.find(r=>r.key===name+':'+variant);if(!r||profiles.some(p=>p.name===name&&p.variant===variant))throw Error('Invalid scope '+name+variant);
  profiles.push({country:r.country,name,variant,make:()=>structuredClone(config),observations,remaining});
}
