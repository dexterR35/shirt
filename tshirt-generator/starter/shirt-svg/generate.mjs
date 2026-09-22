import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderShirt, normalize, TEMPLATE_VERSION } from './shirt-engine.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const input=process.argv[2] || path.join(root,'presets.json');
const output=process.argv[3] || path.join(root,'svg');
const presets=JSON.parse(await fs.readFile(input,'utf8'));
if (!Array.isArray(presets) || !presets.length) throw Error('Expected a non-empty array of shirt configurations.');
const prepared=presets.map(normalize);
if(new Set(prepared.map(p=>p.id)).size!==prepared.length) throw Error('Duplicate variant IDs.');
await fs.mkdir(output,{recursive:true});
for(const p of prepared) await fs.writeFile(path.join(output,p.id+'.svg'),renderShirt(p));
await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify(prepared.map(p=>({...p,template_version:TEMPLATE_VERSION,svg_file:p.id+'.svg',status:'design-prototype',team_id:null,season:null,source_url:null})),null,2));
console.log(`Exported ${prepared.length} transparent SVG shirts to ${output}`);
