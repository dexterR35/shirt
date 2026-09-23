import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
import {fileURLToPath} from 'node:url';

export const ROOT='data/research/footballkitarchive';
/** Keep the literal archive label separately, including explicit carry-over evidence. */
export function canonicalSeason(label){
  if(/^\d{4} \(Carry-over\)$/.test(label))return label.slice(0,4);
  const m=/^(\d{2})-(\d{2})(?: \(Carry-over\))?$/.exec(label);
  return m?`20${m[1]}/${m[2]}`:label;
}
export const normalizeName=s=>s.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/&/g,' and ').replace(/\b(?:fc|afc)\b/g,' ').replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
/** Match only within the captured association; never collapse reserve suffixes. */
export function matchTeam(name,country,teams){
  const key=normalizeName(name);
  const matches=teams.filter(t=>t.country_name===country&&[t.name,...(t.aliases||[])].some(n=>normalizeName(n)===key));
  return matches.length===1?matches[0]:null;
}
export function parseCapture(tsv){
  const [header,...lines]=tsv.trim().split(/\r?\n/),keys=header.split('\t');
  return lines.map(line=>{
    const values=line.split('\t');if(values.length!==keys.length)throw Error('Malformed capture row');
    const r=Object.fromEntries(keys.map((k,i)=>[k,values[i]]));
    if(!['Home','Away'].includes(r.variant)||!/^\d+$/.test(r.kit_id)||!/^[-a-z0-9]+$/.test(r.kit_slug)||!/^\d{4}\/\d{2}\/\d{2}\/[a-zA-Z0-9]+\/[-a-z0-9]+\.jpg$/.test(r.image_path))throw Error('Invalid source capture');
    return r;
  });
}
/** Search results are candidates only, never verified kit references. */
export function discoveryCandidates(response,name){
  const found=[];
  for(const m of String(response).matchAll(/^([^\n]+?) \((https:\/\/www\.footballkitarchive\.com\/[^\s)]+)\)/gm)){
    const title=m[1],sourceName=title.split(/\s+20\d{2}|\s+Kit History|\s+Kits\b/i)[0];
    if(normalizeName(sourceName)===normalizeName(name)&&!found.some(r=>r.url===m[2]))found.push({title,url:m[2]});
  }
  return found;
}
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const save=async(p,data)=>fs.writeFile(p,JSON.stringify(data,null,2)+'\n');
export async function importCaptures({download=false}={}){
  const teams=await read('data/normalized/teams.json'),queue=await read('data/research/kit-research-queue.json');
  const priority=await read('data/research/priority-teams.json');
  const priorityOrder=new Map(priority.teams.map(t=>[t.team_id,t.priority_order]));
  await fs.mkdir(`${ROOT}/records`,{recursive:true});
  await fs.mkdir('data/research/references/footballkitarchive',{recursive:true});
  const records=new Map(),unmatched=[];
  for(const file of (await fs.readdir(`${ROOT}/captures`)).filter(f=>f.endsWith('.json'))){
    const capture=await read(`${ROOT}/captures/${file}`),rows=parseCapture(await fs.readFile(`${ROOT}/captures/${capture.capture_file}`,'utf8'));
    if(rows.length!==capture.record_count)throw Error('Capture count mismatch');
    for(const r of rows){
      const canonicalName=capture.team_aliases?.[r.team]||r.team;
      const team=matchTeam(canonicalName,capture.country,teams);
      if(!team){unmatched.push({name:r.team,country:capture.country,kit_id:r.kit_id,capture:file});continue;}
      const variant=r.variant.toLowerCase(),task=queue.find(q=>q.team_id===team.id&&q.kit_variant===variant);
      const season=canonicalSeason(r.season);
      const requested=priorityOrder.has(team.id)?priority.requested_season:task.candidate_kit_season;
      // Preserve earlier calendar-year observations as context, but also admit an
      // independently verified exact requested season if later found.
      if(season!==task.candidate_kit_season&&season!==requested){unmatched.push({name:r.team,kit_id:r.kit_id,reason:'season_requires_review',season,expected:requested});continue;}
      const record={schemaVersion:1,task_id:task.id,team_id:team.id,team_name:team.name,country_name:team.country_name,variant,kit_season:season,source:'Football Kit Archive',source_team_name:r.team,source_season_label:r.season,source_design:r.design,source_color_names:r.colors.split(' / '),brand:r.brand,source_kit_id:r.kit_id,page_url:`https://www.footballkitarchive.com/${r.kit_slug}-kit-${r.kit_id}/`,image_url:`https://www.footballkitarchive.com/cdn/${r.image_path}`,listing_url:capture.listing_url,checked_at:capture.captured_at,capture_path:`${ROOT}/captures/${capture.capture_file}`,status:'metadata_collected',visual_review:null,official_hex:false};
      const recordPath=`${ROOT}/records/${task.id}.json`;
      try{const old=await read(recordPath);if(old.page_url===record.page_url){for(const key of ['local_reference_path','image_sha256','visual_review','status','artwork_revision_path','download_error'])if(old[key]!==undefined)record[key]=old[key];}}catch(e){if(e.code!=='ENOENT')throw e;}
      const local=`data/research/references/footballkitarchive/${team.id}-${variant}-${r.kit_id}.jpg`;
      if(download&&!record.local_reference_path){
        try{
          const response=await fetch(record.image_url,{signal:AbortSignal.timeout(25000)});
          if(!response.ok||!response.headers.get('content-type')?.startsWith('image/'))throw Error(`Image HTTP ${response.status}`);
          const bytes=Buffer.from(await response.arrayBuffer());
          await fs.writeFile(local,bytes);record.local_reference_path=local;record.image_sha256=crypto.createHash('sha256').update(bytes).digest('hex');record.status='reference_saved';delete record.download_error;
        }catch(e){record.download_error=e.message;}
        await delay(150);
      }
      await save(recordPath,record);records.set(task.id,record);
    }
  }
  const discovery=new Map();
  for(const file of await fs.readdir(`${ROOT}/discovery`).catch(()=>[])){
    const batch=await read(`${ROOT}/discovery/${file}`);
    for(const team of batch.teams)discovery.set(team.id,{checked_at:batch.checked_at,batch_path:`${ROOT}/discovery/${file}`,candidates:discoveryCandidates(batch.response,team.name)});
  }
  const worklist=queue.map(q=>({task_id:q.id,team_id:q.team_id,team_name:q.team_name,country_name:q.country_name,variant:q.kit_variant,candidate_kit_season:q.candidate_kit_season,source_competition_seasons:q.source_competition_seasons,status:records.get(q.id)?.status||(discovery.has(q.team_id)?'source_candidates_need_review':'pending_source_lookup'),discovery:discovery.get(q.team_id)||null,record_path:records.has(q.id)?`${ROOT}/records/${q.id}.json`:null}));
  for(const task of worklist){
    task.mandatory=priorityOrder.has(task.team_id);task.priority_order=priorityOrder.get(task.team_id)??null;
    task.requested_season=task.mandatory?priority.requested_season:null;
    const record=records.get(task.task_id);
    if(task.mandatory&&record&&record.kit_season!==task.requested_season){
      task.other_season_record_path=task.record_path;task.record_path=null;
      task.status='requested_season_not_verified';
    }
  }
  worklist.sort((a,b)=>Number(b.mandatory)-Number(a.mandatory)||(a.priority_order??9999)-(b.priority_order??9999));
  await save(`${ROOT}/worklist.json`,worklist);
  const summary={updated_at:new Date().toISOString(),source:'https://www.footballkitarchive.com/',teams:teams.length,slots:queue.length,teams_searched:discovery.size,teams_with_search_candidates:[...discovery.values()].filter(d=>d.candidates.length).length,teams_with_metadata:new Set([...records.values()].map(r=>r.team_id)).size,metadata_collected:records.size,references_saved:[...records.values()].filter(r=>r.local_reference_path).length,artwork_reviewed:[...records.values()].filter(r=>r.visual_review).length,remaining_reference_slots:queue.length-records.size,pending_source_lookup:worklist.filter(r=>r.status==='pending_source_lookup').length,unmatched,notes:'Source collection does not certify rendered artwork. Existing approved revisions remain separate until compared with the archive. No missing record is replaced with an inferred team kit.'};
  await save(`${ROOT}/progress.json`,summary);console.log(summary);return summary;
}
if(process.argv[1]===fileURLToPath(import.meta.url))await importCaptures({download:process.argv.includes('--download')});
