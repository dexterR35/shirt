import fs from 'node:fs/promises';
import {canonicalSeason} from './fka-import.mjs';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const root='data/research/footballkitarchive',observations=await read(`${root}/observations/latest-available-details.json`),policy=await read('data/research/season-policy.json');
const fields=['team','variant','season','design','colors','brand','kit_slug','kit_id','image_path','sponsor','competitions','release_date','source_season_label'];
policy.updated_at='2026-09-25';
policy.instruction='Prefer independently evidenced 2026/27, calendar 2026 and 2025/26 (Finnish calendar 2025). User additionally authorized the latest available older equipment on 25 September 2026 when no 2025, 2026 or 2027 reference exists. Select Home and Away independently, retain literal source seasons, and record each fallback with its history and detail URL. Preserve canonical reserve identities; no Third, GK or first-team substitution. Event listings may support the same canonical variant.';
for(const country of [...new Set(observations.map(o=>o.country))]){
 const rows=observations.filter(o=>o.country===country),aliases={},lines=[];
 for(const o of rows){
  const f=o.detail.fields;if(f.Type.toLowerCase()!==o.variant||(o.detail.countries.length&&!o.detail.countries.some(c=>c.name===country)))throw Error('Variant/country mismatch '+o.name);
  const m=/\/([-a-z0-9]+)-kit-(\d+)\/$/.exec(o.url);if(!m)throw Error('Invalid URL');
  const year=/((?:19|20)\d{2})(?:-(\d{2}))?-(?:home|away)$/.exec(m[1]);if(!year)throw Error('Season absent '+o.url);
  const season=year[1]+(year[2]?'/'+year[2]:'');
  if(canonicalSeason(f.Season)!==season&&!/^\d{2}-\d{2}$/.test(f.Season))throw Error('Unexpected season '+f.Season);
  aliases[f.Team]=o.name;
  const row=[f.Team,f.Type,season,f.Design||'',f.Colors||'',f.Brand||'',m[1],m[2],o.detail.images[0].split('/cdn/')[1],f.Sponsor||'',(f.Competitions||'').replace(/\n/g,' | '),f['Release date']||'',f.Season];
  if(row.some(x=>/[\t\r\n]/.test(x)))throw Error('Unescaped capture');lines.push(row.join('\t'));
  if(season!=='2026/27'&&!policy.fallbacks.some(p=>p.team_id===o.team_id&&p.variant===o.variant&&p.season===season))policy.fallbacks.push({team_id:o.team_id,variant:o.variant,season,source_url:o.url,history_url:o.history_url,reason:'Latest independently labeled '+o.variant+' source found in the live team history; no newer independently labeled equipment found for this slot. User authorized latest available equipment on 25 September 2026. Actual source season retained.'});
 }
 const name=`latest-available-${country.toLowerCase()}-2026-09-25`;
 await fs.writeFile(`${root}/captures/${name}.tsv`,[fields.join('\t'),...lines].join('\n')+'\n');
 await fs.writeFile(`${root}/captures/${name}.json`,JSON.stringify({schemaVersion:1,country,listing_url:'https://www.footballkitarchive.com/',captured_at:'2026-09-25',method:'Live rendered team histories checked first, newest independently labeled Home/Away selected per slot, then individual detail table and full front link read. Full-century season is grounded in the source title/URL; source_season_label retains the literal table label. See observations/latest-available-details.json for each history, source title and country.',capture_file:name+'.tsv',record_count:rows.length,team_aliases:aliases},null,2)+'\n');
 console.log(country,rows.length);
}
await fs.writeFile('data/research/season-policy.json',JSON.stringify(policy,null,2)+'\n');
