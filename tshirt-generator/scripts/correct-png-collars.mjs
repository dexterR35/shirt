import fs from 'node:fs/promises';
import {baseCollarPaint} from '../src/lib/png-collar.js';
import {validateConfig} from '../src/lib/shirt-renderer.js';

// Supersede the eight painted V/polo layouts without changing reviewed p001.
const directory='data/kits/png-layouts';
for(const file of (await fs.readdir(directory)).filter(f=>f.endsWith('-p001.json'))){
  const previous=JSON.parse(await fs.readFile(`${directory}/${file}`,'utf8'));
  const layers=previous.config.collar.layers;
  const vBands=layers.filter(l=>l.id.startsWith('v-neck-band-'));
  const polo=layers.some(l=>l.id==='polo-placket');
  if(!vBands.length&&!polo)continue;
  const next=structuredClone(previous);
  const weights=vBands.length===5?[1,1.5,.9,1.5,.6]:vBands.length===3?[2.7,1.1,1.2]:[3.5,.85];
  const bands=vBands.length?vBands.map((l,i)=>({color:l.fill,weight:weights[i]||1}))
    :[{color:next.config.colors.collar,weight:4},{color:layers.find(l=>l.id==='polo-edge-left').fill,weight:.6}];
  next.config.colors.collar=bands[0].color;
  next.config.collar=baseCollarPaint(next.config,bands);
  validateConfig(next.config);
  next.layout_revision='p002';
  next.supersedes_layout_revision='p001';
  next.status=process.argv.includes('--reviewed')?'reviewed':'draft';
  next.review_scope='Collar colors follow only the sewn round neckline of the original PNG. The painted V, polo flaps and placket have been removed at the user’s request. Shoulder, body and cuff artwork retained from p001.';
  next.changes='Removed the second drawn collar. Team collar colors are mapped onto the existing PNG collar ring, retaining original fabric and stitching.';
  next.limitations='Common round-neck PNG base retained. This is a color adaptation, not a reproduction of the source kit’s collar construction. Other fabric patterns may remain approximate.';
  const target=`${directory}/${file.replace('-p001','-p002')}`,content=JSON.stringify(next,null,2)+'\n';
  try{
    const existing=await fs.readFile(target,'utf8');
    if(existing!==content&&JSON.parse(existing).status==='reviewed')throw Error(`Immutable layout changed: ${target}`);
  }catch(e){if(e.code!=='ENOENT')throw e;}
  await fs.writeFile(target,content);
  console.log(next.team_name,next.variant,next.status);
}
