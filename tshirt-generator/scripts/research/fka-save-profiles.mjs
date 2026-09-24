import fs from 'node:fs/promises';
import {validateConfig,SURFACE_VERSION} from '../../src/lib/shirt-renderer.js';
import {permittedSeason} from './season-policy.mjs';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const save=async(p,v)=>fs.writeFile(p,JSON.stringify(v,null,2)+'\n');
/** Save only source-specific drawings; ready promotion requires explicit visual review. */
export async function saveProfiles(profiles,batch,{reviewed=[],date='2026-09-23'}={}){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Review date must be YYYY-MM-DD');
  const priority=await read('data/research/priority-teams.json');
  const root='data/research/footballkitarchive',records=[];
  for(const f of await fs.readdir(`${root}/records`))records.push(await read(`${root}/records/${f}`));
  const output=[];
  for(const p of profiles){
    const r=records.find(x=>x.team_name===p.name&&x.variant===p.variant&&x.country_name===p.country);
    if(!r?.local_reference_path)throw Error(`Missing reference ${p.name} ${p.variant}`);
    if(priority.teams.some(t=>t.team_id===r.team_id)&&!permittedSeason(r.team_id,r.variant,r.kit_season,priority.requested_season))
      throw Error(`Mandatory kit requires ${priority.requested_season}; ${p.name} reference is ${r.kit_season}`);
    const config=p.make();
    try{validateConfig(config);}catch(error){throw new Error(`${p.name} ${p.variant}: ${error.message}`,{cause:error});}
    const key=`${r.team_id}-${r.variant}`,files=(await fs.readdir('data/kits')).filter(f=>f.startsWith(`${key}-r`)&&f.endsWith('.json'));
    let own=null,max=0;
    for(const f of files){const k=await read(`data/kits/${f}`);max=Math.max(max,Number(k.revision.slice(1)));if(k.research_batch===batch)own=k;}
    const revision=own?.revision||`r${String(max+1).padStart(3,'0')}`;
    const layoutFiles=(await fs.readdir('data/kits/png-layouts')).filter(f=>f.startsWith(`${key}-p`)&&f.endsWith('.json'));
    let ownLayout=null,maxLayout=0;
    for(const f of layoutFiles){const l=await read(`data/kits/png-layouts/${f}`);maxLayout=Math.max(maxLayout,Number(l.layout_revision.slice(1)));if(l.research_batch===batch)ownLayout=l;}
    const layoutRevision=ownLayout?.layout_revision||`p${String(maxLayout+1).padStart(3,'0')}`;
    const ready=reviewed.includes(`${p.name}:${p.variant}`),target=`data/kits/${key}-${revision}.json`,layoutPath=`data/kits/png-layouts/${key}-${layoutRevision}.json`;
    const review=ready?{reviewed_by:'Codex',reviewed_at:date,human_approved:false,outcome:'source-reviewed PNG adaptation',notes:p.observations,render_path:`artifacts/footballkitarchive/${batch}/${key}.png`}:null;
    const references=[{publisher:'Football Kit Archive',page_url:r.page_url,image_url:r.image_url,local_path:r.local_reference_path,checked_at:r.checked_at,source_type:'user-designated source of truth',variant:r.variant,kit_season:r.kit_season}];
    const kit={schemaVersion:1,team_id:r.team_id,team_name:r.team_name,country_name:r.country_name,variant:r.variant,kit_season:r.kit_season,revision,research_batch:batch,status:ready?'ready':'draft',surface_version:SURFACE_VERSION,references,color_evidence:{basis:'Estimated from the independently saved archive front image; not official HEX.',official_hex:false,source_color_names:r.source_color_names,values:config.colors},observations:p.observations,omitted:'Emblems, logos, sponsors and lettering. Original PNG collar construction retained.',visual_review:review,config};
    const layout={schemaVersion:1,team_id:r.team_id,team_name:r.team_name,variant:r.variant,source_revision:revision,layout_revision:layoutRevision,research_batch:batch,surface_version:'original-png-composite-1',status:ready?'reviewed':'draft',reviewed_by:'Codex',reviewed_at:date,human_approved:false,review_scope:p.observations,limitations:'Colors and placement are visual adaptations; original PNG round collar, fabric and folds retained.',references:[{local_path:r.local_reference_path,page_url:r.page_url,sha256:r.image_sha256}],config};
    for(const [file,value,old] of [[target,kit,own],[layoutPath,layout,ownLayout]]){
      if(old&&['ready','reviewed'].includes(old.status)&&JSON.stringify(old)!==JSON.stringify(value))throw Error(`Immutable reviewed revision: ${file}`);
      await save(file,value);
    }
    const resultPath=`data/research/results/${r.task_id}.json`,result=await read(resultPath);
    if(ready||result.status!=='ready'){
      Object.assign(result,{status:kit.status,kit_season:r.kit_season,kit_revision_path:target,references,color_evidence:kit.color_evidence,visual_review:review,remaining:ready?[]:[p.remaining||'Compare the source image and refine artwork before marking ready.']});
      result.footballkitarchive={record_path:`${root}/records/${r.task_id}.json`,source_kit_id:r.source_kit_id};
      result.research_log=[...(result.research_log||[]).filter(x=>x.batch!==batch),{date,batch,action:ready?'Compared archive reference with PNG adaptation.':'Created source-specific draft for visual comparison.'}];
      await save(resultPath,result);
    }
    if(ready){Object.assign(r,{status:'artwork_reviewed',visual_review:review,artwork_revision_path:target});await save(`${root}/records/${r.task_id}.json`,r);}
    output.push({name:p.name,variant:p.variant,kit:target,layout:layoutPath,reference:r.local_reference_path,status:kit.status});
  }
  await fs.mkdir(`artifacts/footballkitarchive/${batch}`,{recursive:true});
  await save(`artifacts/footballkitarchive/${batch}/manifest.json`,output);
  console.log(batch,output.length,'profiles;',output.filter(x=>x.status==='ready').length,'ready');
}
