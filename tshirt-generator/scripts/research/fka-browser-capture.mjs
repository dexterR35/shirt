/** Read-only fallback for a Codex browser tab after normal page access succeeds.
 * Call through cua_repl using an existing tab. Links must come from an observed
 * archive listing; this never guesses URLs, fetches hidden APIs or solves checks.
 * @param {object} tab Browser tab exposing goto and playwright.evaluate.
 * @param {{title:string,url:string}[]} links Observed Home/Away anchor URLs.
 */
export async function scrapeObservedKitLinks(tab,links){
  const records=[];
  for(const link of links){
    if(!/^https:\/\/www\.footballkitarchive\.com\/[-a-z0-9]+-kit-\d+\/$/.test(link.url))throw Error('Unexpected kit URL');
    await tab.goto(link.url);
    const record=await tab.playwright.evaluate(()=>({
      title:document.querySelector('h1')?.innerText.trim(),
      fields:Object.fromEntries([...document.querySelectorAll('table tr')].map(r=>[...r.querySelectorAll('td')].map(c=>c.innerText.trim())).filter(r=>r.length===2)),
      images:[...document.querySelectorAll('a[href*="/cdn/"]')].map(a=>a.href),
      country_links:[...document.querySelectorAll('a[href*="/country/"]')].map(a=>({name:a.innerText.trim(),url:a.href})),
    }));
    if(!record.title||!['Home','Away'].includes(record.fields.Type)||!record.images.length)throw Error(`Page requires inspection: ${link.url}`);
    records.push({...record,url:link.url,checked_at:new Date().toISOString(),visually_verified:false});
  }
  return records;
}
