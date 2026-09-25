import fs from 'node:fs/promises';
import {canonicalSeason} from './fka-import.mjs';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const write=async(p,v)=>fs.writeFile(p,JSON.stringify(v,null,2)+'\n');
const root='data/research/footballkitarchive',details=await read(`${root}/observations/rest-details.json`);
const policy=await read('data/research/season-policy.json');
const fields=['team','variant','season','design','colors','brand','kit_slug','kit_id','image_path','sponsor','competitions','release_date','source_variant_label'];
for(const country of [...new Set(details.map(d=>d.country))]){
 const rows=details.filter(d=>d.country===country),lines=[],aliases={};
 for(const d of rows){
  const f=d.detail.fields;
  if(!new RegExp(`^(?:(?:Champions|Europa|Conference) League )?${d.variant}(?: V2)?$`,'i').test(f.Type))throw Error('Variant mismatch '+d.name);
  if(canonicalSeason(f.Season)!==d.season)throw Error('Season mismatch '+d.name);
  if(!d.detail.team_history.includes(d.history_url))throw Error('Identity mismatch '+d.name);
  const match=d.url.match(/\/([^/]+)-kit-(\d+)\/$/);if(!match||!d.detail.images[0])throw Error('Missing source');
  const season=d.season;
  if(season!=='2026/27'&&!policy.fallbacks.some(p=>p.team_id===d.team_id&&p.variant===d.variant&&p.season===season))policy.fallbacks.push({team_id:d.team_id,variant:d.variant,season,history_url:d.history_url,source_url:d.url,reason:'Latest independently labeled variant selected from the live full club history, retaining its calendar or previous-season label under the authorized latest-equipment policy.'});
  let existing=null;try{existing=await read(`${root}/records/${d.task_id}.json`);}catch(e){if(e.code!=='ENOENT')throw e;}
  if(existing&&!existing.capture_path.includes('/rest-')){
   if(existing.page_url!==d.url)throw Error('Existing source needs separate reconciliation '+d.name);
   continue;
  }
  const row=[f.Team,d.variant==='home'?'Home':'Away',f.Season,f.Design||'',f.Colors||'',f.Brand||'',match[1],match[2],d.detail.images[0].split('/cdn/')[1],f.Sponsor||'',(f.Competitions||'').replace(/\n/g,' | '),f['Release date']||'',f.Type];
  if(row.some(v=>/[\t\r\n]/.test(v)))throw Error('Unescaped TSV');
  lines.push(row.join('\t'));aliases[f.Team]=d.name;
 }
 if(!lines.length)continue;
 const slug=country.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,'-');
 const batch=`rest-${slug}-2026-09-25`;
 await fs.writeFile(`${root}/captures/${batch}.tsv`,[fields.join('\t'),...lines].join('\n')+'\n');
 await write(`${root}/captures/${batch}.json`,{schemaVersion:1,country,listing_url:'https://www.footballkitarchive.com/',captured_at:'2026-09-25',method:'Live UEFA competition listings identify canonical club histories. Full history inspected, latest season selected separately for Home/Away, preferring the standard version within the same season. Each exact detail table and front image link captured independently. Explicit event Home/Away or Away V2 variants retain their source_variant_label. See observations/rest-details.json.',capture_file:batch+'.tsv',record_count:lines.length,team_aliases:aliases});
 console.log(country,lines.length);
}
await write('data/research/season-policy.json',policy);
