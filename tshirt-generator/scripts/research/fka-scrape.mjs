import fs from 'node:fs/promises';
import {setTimeout as delay} from 'node:timers/promises';
import {fileURLToPath} from 'node:url';
import {ROOT,normalizeName} from './fka-import.mjs';
const decode=s=>s.replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/\s+/g,' ').trim();
/** Parse public rendered markup only; no scripts, private endpoints or inferred colors. */
export function parseKitHtml(html,url){
  if(/Just a moment|Verify you are human|cf-chl-/i.test(html))throw Error('browser_verification_required');
  const title=decode(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||'');
  const fields={};
  for(const row of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
    const cells=[...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(m=>decode(m[1]));
    if(cells.length===2)fields[cells[0]]=cells[1];
  }
  const images=[...html.matchAll(/<a\b[^>]*href=["']([^"']+\.(?:jpg|png|webp)(?:\?[^"']*)?)["']/gi)].map(m=>new URL(m[1],url).href).filter(u=>u.startsWith('https://www.footballkitarchive.com/cdn/'));
  if(!title||!fields.Team||!fields.Season||!['Home','Away'].includes(fields.Type)||!images.length)throw Error('not_a_complete_home_away_kit_page');
  return {title,fields,page_url:url,image_url:images[0]};
}
export async function scrape({limit=50}={}){
  if(!Number.isInteger(limit)||limit<1)throw Error('Use a positive integer --limit');
  const worklist=JSON.parse(await fs.readFile(`${ROOT}/worklist.json`,'utf8'));
  await fs.mkdir(`${ROOT}/http-captures`,{recursive:true});
  const urls=new Map();
  for(const task of worklist.filter(t=>!t.record_path))for(const candidate of task.discovery?.candidates||[]){
    if(/-(?:home|away)-kit-\d+\/$/.test(candidate.url)&&new URL(candidate.url).hostname==='www.footballkitarchive.com')urls.set(candidate.url,task);
  }
  const report={started_at:new Date().toISOString(),attempted:0,collected:0,transport:'direct-public-http',outcomes:[]};
  for(const [url,task] of [...urls].slice(0,limit)){
    report.attempted++;
    try{
      const response=await fetch(url,{signal:AbortSignal.timeout(25000)});
      if([403,429].includes(response.status)){
        report.blocked={url,status:response.status,reason:response.status===403?'browser_verification_required':'rate_limited',next_action:'Continue with ordinary browser page reads and public image links; preserve the checkpoint.'};break;
      }
      if(!response.ok)throw Error(`HTTP ${response.status}`);
      const html=await response.text(),record=parseKitHtml(html,url);
      if(normalizeName(record.fields.Team)!==normalizeName(task.team_name))throw Error('team_identity_needs_review');
      const id=url.match(/-kit-(\d+)\//)[1];
      const matchedTask=worklist.find(t=>t.team_id===task.team_id&&t.variant===record.fields.Type.toLowerCase());
      await fs.writeFile(`${ROOT}/http-captures/${id}.json`,JSON.stringify({...record,task_id:matchedTask.task_id,status:'candidate_needs_season_country_and_visual_review',checked_at:new Date().toISOString()},null,2)+'\n');
      report.collected++;
    }catch(e){report.outcomes.push({url,error:e.message});if(e.message==='browser_verification_required'){report.blocked={url,reason:e.message};break;}}
    await delay(1000);
  }
  await fs.writeFile(`${ROOT}/http-checkpoint.json`,JSON.stringify(report,null,2)+'\n');console.log(report);return report;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const flag=process.argv.find(a=>a.startsWith('--limit='));await scrape({limit:flag?Number(flag.slice(8)):50});}
