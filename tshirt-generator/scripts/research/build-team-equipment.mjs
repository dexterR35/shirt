import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {loadDisplayNames} from '../team-display-names.mjs';
import {permittedSeason,fallbackFor} from './season-policy.mjs';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const save=async(p,v)=>fs.writeFile(p,JSON.stringify(v,null,2)+'\n');

/** Parse literal English release dates without locale or timezone dependence. */
export function releaseDateISO(value){
  if(!value)return null;
  const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const match=/^(\w+) (\d{1,2}), (\d{4})$/.exec(value);
  if(!match||!months.includes(match[1]))throw Error(`Unsupported archive release date: ${value}`);
  const month=months.indexOf(match[1])+1,day=Number(match[2]),year=Number(match[3]);
  if(new Date(Date.UTC(year,month-1,day)).getUTCMonth()!==month-1)throw Error(`Invalid release date: ${value}`);
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

/** Offline materialization. Never fetch live data during build or app use. */
export async function buildTeamEquipment(){
  const teams=await read('data/normalized/teams.json');
  const displayName=await loadDisplayNames(teams);
  const priority=await read('data/research/priority-teams.json');
  const provenance=await read('data/research/footballkitarchive/equipment-fields-provenance.json');
  const gaps=await read('data/research/footballkitarchive/mandatory-gaps.json');
  const extras=new Map();
  const [header,...lines]=(await fs.readFile(provenance.capture_path,'utf8')).replace(/\r/g,'').split('\n');
  if(header!=='kit_id\tsponsor\tcompetitions\trelease_date')throw Error('Invalid equipment capture header');
  for(const line of lines.filter(Boolean)){
    const [id,sponsor,competitions,date,...rest]=line.split('\t');
    if(!/^\d+$/.test(id)||date===undefined||rest.length||extras.has(id))throw Error(`Invalid or duplicate equipment row: ${id}`);
    extras.set(id,{sponsor:sponsor||null,competitions:competitions?competitions.split(' | '):[],release_date:date||null,release_date_iso:releaseDateISO(date)});
  }
  const records=new Map();
  for(const file of (await fs.readdir('data/research/footballkitarchive/records')).filter(f=>f.endsWith('.json'))){
    const r=await read(`data/research/footballkitarchive/records/${file}`);
    const key=`${r.team_id}:${r.variant}`;
    if(records.has(key))throw Error(`Duplicate source slot: ${key}`);
    if(!teams.some(t=>t.id===r.team_id)||!['home','away'].includes(r.variant))throw Error(`Invalid source identity: ${file}`);
    records.set(key,r);
  }
  const output=new Map();
  await fs.mkdir('data/teams',{recursive:true});
  for(const team of teams){
    const p=priority.teams.find(p=>p.team_id===team.id);
    const data={schemaVersion:1,team_id:team.id,team_name:displayName(team).name,country_name:team.country_name,
      mandatory:!!p,priority_order:p?.priority_order??null,requested_season:p?.requested_season??null,
      other_season_references:['home','away'].map(v=>records.get(`${team.id}:${v}`)).filter(r=>r&&p&&!permittedSeason(team.id,r.variant,r.kit_season,p.requested_season)).map(r=>({variant:r.variant,season:r.kit_season,page_url:r.page_url,record_path:`data/research/footballkitarchive/records/${r.task_id}.json`,note:'Outside the requested season and explicit fallback scope; retained as research context only.'})),
      kits:Object.fromEntries(['home','away'].map(variant=>{
        const observed=records.get(`${team.id}:${variant}`);
        const mismatch=observed&&p&&!permittedSeason(team.id,variant,observed.kit_season,p.requested_season);
        const r=mismatch?null:observed,e=r&&extras.get(r.source_kit_id);
        return [variant,{variant,type:variant==='home'?'Home':'Away',status:r?'source_saved':'pending_research',
          season:r?.kit_season??null,source_season_label:r?.source_season_label??null,
          season_fallback:r?fallbackFor(team.id,variant,r.kit_season):null,
          source_team_name:r?.source_team_name??null,design:r?.source_design??null,
          colors:r?.source_color_names??[],color_values_official:false,brand:r?.brand??null,
          sponsor:e?.sponsor??null,competitions:e?.competitions??[],release_date:e?.release_date??null,release_date_iso:e?.release_date_iso??null,
          extended_fields_checked:!!e,
          source_issue:r?(r.detail_page_issue??null):mismatch?{checked_at:observed.checked_at,url:observed.page_url,outcome:`Archive labels the observed kit ${observed.kit_season}; a ${p.requested_season} Home/Away reference is still required.`}:(gaps.attempts.find(a=>a.team_id===team.id&&a.variant===variant)??null),
          source:r?{publisher:r.source,url:r.page_url,kit_id:r.source_kit_id,checked_at:r.checked_at,
            evidence_url:r.listing_url??r.page_url,
            record_path:`data/research/footballkitarchive/records/${r.task_id}.json`,
            extended_fields_capture:e?provenance.capture_path:null,extended_fields_checked_at:e?(provenance.supplemental_checks?.find(c=>c.kit_id===r.source_kit_id)?.checked_at??provenance.checked_at):null}:null}];
      }))};
    await save(`data/teams/${team.id}.json`,data);output.set(team.id,data);
  }
  return {teams:output,priority};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const {teams,priority}=await buildTeamEquipment();
  console.log({local_team_files:teams.size,mandatory_teams:priority.team_count,source_slots:[...teams.values()].flatMap(t=>Object.values(t.kits)).filter(k=>k.source).length});
}
