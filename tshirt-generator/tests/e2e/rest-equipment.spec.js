import {test,expect} from '@playwright/test';

test('remaining teams expose exact event/fallback labels and export distinct local transparent shirts',async({page})=>{
 const external=[];
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!['localhost','127.0.0.1'].includes(new URL(r.url()).hostname))external.push(r.url());});
 await page.goto('/studio');
 const canvas=page.locator('.shirt-image'),card=page.getByRole('region',{name:'Applied kit details'});
 for(const [name,country,variant,season,type]of [
  ['Bodø/Glimt','Norway','Home','26-27','Champions League Home'],
  ['Bodø/Glimt','Norway','Away','2026','Away'],
  ['Lillestrøm','Norway','Away','26-27','Europa League Away'],
  ['Levski Sofia','Bulgaria','Away','26-27','Away V2'],
  ['Torreense','Portugal','Away','25-26','Away'],
  ['Kauno Žalgiris','Lithuania','Home','2026 (Carry-over)','Home']
 ]){
  await page.getByLabel('Team',{exact:true}).fill(name);
  await page.getByRole('button',{name:new RegExp(`${name} ${country}`)}).click();
  await page.getByRole('button',{name:variant,exact:true}).click();
  await expect(canvas).toHaveAttribute('aria-label',`${name} ${variant.toLowerCase()} shirt`);
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  await expect(card).toContainText(season);await expect(card).toContainText(type);
  await page.getByRole('button',{name:'Add to collection',exact:true}).click();
 }
 const tray=page.getByRole('region',{name:'Collection'}),downloads=[];
 await expect(tray.locator('.collection-item')).toHaveCount(6);
 await tray.getByLabel('Download size').selectOption('168');page.on('download',d=>downloads.push(d));
 await tray.getByRole('button',{name:'Download all',exact:true}).click();
 await page.getByRole('dialog').getByRole('button',{name:'Yes, download'}).click();
 await expect.poll(()=>downloads.length).toBe(6);
 const fs=await import('node:fs/promises'),sharp=(await import('sharp')).default,crypto=await import('node:crypto'),hashes=[];
 for(const d of downloads){
  const bytes=await fs.readFile(await d.path()),meta=await sharp(bytes).metadata();
  expect([meta.format,meta.width,meta.height,meta.hasAlpha]).toEqual(['png',168,168,true]);
  const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  expect(data[3]).toBe(0);expect(data[(84*info.width+84)*4+3]).toBe(255);
  hashes.push(crypto.createHash('sha256').update(bytes).digest('hex'));
 }
 expect(new Set(hashes).size).toBe(6);expect(external).toEqual([]);
 await page.screenshot({path:'artifacts/footballkitarchive/rest-2026-09-25/studio-ready.png',fullPage:true});
});
