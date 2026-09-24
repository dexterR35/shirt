import {test,expect} from '@playwright/test';

test('Tier 2 reviewed variants apply offline with independent equipment and unfinished slots stay unavailable',async({page})=>{
 const external=[];
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!['localhost','127.0.0.1'].includes(new URL(r.url()).hostname))external.push(r.url());});
 await page.goto('/studio');
 const canvas=page.locator('.shirt-image'),card=page.getByRole('region',{name:'Applied kit details'});
 for(const [name,country,variant,brand,season='26-27']of [
  ['Birmingham City','England','Home','Nike'],['Birmingham City','England','Away','Nike'],
  ['1. FC Heidenheim','Germany','Away','Puma'],['Pisa','Italy','Away','adidas'],
  ['Chindia Târgoviște','Romania','Away','Nike'],['Chindia Târgoviște','Romania','Home','Nike'],
  ['Palermo','Italy','Away','Puma'],['VfL Wolfsburg','Germany','Home','Nike'],
  ['Dijon','France','Away','Nike'],['Reims','France','Away','Puma'],
  ['Sochaux','France','Away','Eldera'],
  ['Córdoba','Spain','Away','Joma'],['Girona','Spain','Away','Puma'],
  ['Olympiacos B','Greece','Away','adidas'],['Hellas Syros','Greece','Home','Capelli'],
  ['FC Haka','Finland','Home','Puma','2026'],
 ]){
  await page.getByLabel('Team',{exact:true}).fill(name);
  await page.getByRole('button',{name:new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')} ${country}`)}).click();
  await page.getByRole('button',{name:variant,exact:true}).click();
  await expect(canvas).toHaveAttribute('aria-label',`${name} ${variant.toLowerCase()} shirt`);
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  await expect(card).toContainText(season);await expect(card).toContainText(brand);
  await expect(page.getByRole('button',{name:'Add to collection',exact:true})).toBeEnabled();
 }
 await page.screenshot({path:'artifacts/footballkitarchive/tier2-studio-ready.png',fullPage:true});
 await page.getByLabel('Team',{exact:true}).fill('CSC Dumbrăvița');
 await page.getByRole('button',{name:/CSC Dumbrăvița Romania/}).click();
 await expect(canvas).toHaveAttribute('aria-label','Original PNG shirt');
 await expect(page.locator('.canvas-caption p')).toHaveText('Home kit not available yet');
 await expect(page.getByRole('button',{name:'Add to collection',exact:true})).toBeDisabled();
 expect(external).toEqual([]);
});

test('Tier 2 painted shirts export distinct transparent PNGs from the collection',async({page})=>{
 await page.goto('/studio');
 for(const [name,country,variant]of [['Córdoba','Spain','Away'],['Hellas Syros','Greece','Home'],['FC Haka','Finland','Home']]){
  await page.getByLabel('Team',{exact:true}).fill(name);
  await page.getByRole('button',{name:new RegExp(`${name} ${country}`)}).click();
  await page.getByRole('button',{name:variant,exact:true}).click();
  await expect(page.locator('.shirt-image')).toHaveAttribute('data-render-state','ready');
  await page.getByRole('button',{name:'Add to collection',exact:true}).click();
 }
 const tray=page.getByRole('region',{name:'Collection'}),downloads=[];
 await expect(tray.locator('.collection-item')).toHaveCount(3);
 await tray.getByLabel('Download size').selectOption('168');
 page.on('download',d=>downloads.push(d));
 await tray.getByRole('button',{name:'Download all',exact:true}).click();
 await page.getByRole('dialog').getByRole('button',{name:'Yes, download'}).click();
 await expect.poll(()=>downloads.length).toBe(3);
 const fs=await import('node:fs/promises'),sharp=(await import('sharp')).default,crypto=await import('node:crypto');
 const hashes=[];
 for(const d of downloads){
  const bytes=await fs.readFile(await d.path()),meta=await sharp(bytes).metadata();
  expect([meta.format,meta.width,meta.height,meta.hasAlpha]).toEqual(['png',168,168,true]);
  const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  expect(data[3]).toBe(0);expect(data[(84*info.width+84)*4+3]).toBe(255);
  hashes.push(crypto.createHash('sha256').update(bytes).digest('hex'));
 }
 expect(new Set(hashes).size).toBe(3);
});
