import {test,expect} from '@playwright/test';

test('Greek current and previous-season shirts retain independent seasons and export reviewed paint',async({page})=>{
  await page.goto('/studio');
  const canvas=page.locator('.shirt-image'),card=page.getByRole('region',{name:'Applied kit details'});
  for(const [name,homeSeason,awaySeason] of [['Lamia','25-26','26-27'],['Egaleo','25-26','25-26'],['Pannaxiakos','26-27','26-27']]){
    await page.getByLabel('Team',{exact:true}).fill(name);
    await page.getByRole('button',{name:new RegExp(`${name} Greece`)}).click();
    for(const [variant,season] of [['Home',homeSeason],['Away',awaySeason]]){
      await page.getByRole('button',{name:variant,exact:true}).click();
      await expect(canvas).toHaveAttribute('aria-label',`${name} ${variant.toLowerCase()} shirt`);
      await expect(canvas).toHaveAttribute('data-render-state','ready');
      await expect(card).toContainText(season);
      if(name==='Egaleo')await page.getByRole('button',{name:'Add to collection',exact:true}).click();
    }
  }
  const tray=page.getByRole('region',{name:'Collection'}),downloads=[];
  await expect(tray.locator('.collection-item')).toHaveCount(2);
  await tray.getByLabel('Download size').selectOption('168');
  page.on('download',d=>downloads.push(d));
  await tray.getByRole('button',{name:'Download all',exact:true}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Yes, download'}).click();
  await expect.poll(()=>downloads.length).toBe(2);
  const fs=await import('node:fs/promises'),sharp=(await import('sharp')).default;
  const pixels=[];
  for(const d of downloads){
    const bytes=await fs.readFile(await d.path()),meta=await sharp(bytes).metadata();
    expect([meta.format,meta.width,meta.height,meta.hasAlpha]).toEqual(['png',168,168,true]);
    const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    expect(data[3]).toBe(0);expect(data[(84*info.width+84)*4+3]).toBe(255);
    pixels.push(data);
  }
  expect(pixels[0].equals(pixels[1])).toBe(false);
});

test('League One batch applies all independent variants locally and exports transparent PNGs',async({page})=>{
  const external=[];
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!['localhost','127.0.0.1'].includes(new URL(r.url()).hostname))external.push(r.url());});
  await page.goto('/studio');
  const canvas=page.locator('.shirt-image'),card=page.getByRole('region',{name:'Applied kit details'});
  for(const [name,brand] of [['AFC Wimbledon','Lotto'],['Barnsley','Oxen'],['Blackpool','Puma'],['Bradford City','Macron'],['Bromley','Macron'],['Burton Albion','Admiral'],['Cambridge United','Umbro'],['Doncaster Rovers','Oxen']]){
    await page.getByLabel('Team',{exact:true}).fill(name);
    await page.getByRole('button',{name:new RegExp(`${name} England`)}).click();
    for(const variant of ['Home','Away']){
      await page.getByRole('button',{name:variant,exact:true}).click();
      await expect(canvas).toHaveAttribute('aria-label',`${name} ${variant.toLowerCase()} shirt`);
      await expect(canvas).toHaveAttribute('data-render-state','ready');
      await expect(card).toContainText('26-27');await expect(card).toContainText(brand);
      await expect(page.getByRole('button',{name:'Add to collection',exact:true})).toBeEnabled();
      if(['Barnsley','Blackpool'].includes(name))await page.getByRole('button',{name:'Add to collection',exact:true}).click();
    }
  }
  const tray=page.getByRole('region',{name:'Collection'}),downloads=[];
  await expect(tray.locator('.collection-item')).toHaveCount(4);
  await tray.getByLabel('Download size').selectOption('168');
  page.on('download',d=>downloads.push(d));
  await tray.getByRole('button',{name:'Download all',exact:true}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Yes, download'}).click();
  await expect.poll(()=>downloads.length).toBe(4);
  const fs=await import('node:fs/promises'),sharp=(await import('sharp')).default,crypto=await import('node:crypto');
  const hashes=[];
  for(const d of downloads){
    const bytes=await fs.readFile(await d.path()),meta=await sharp(bytes).metadata();
    expect([meta.format,meta.width,meta.height,meta.hasAlpha]).toEqual(['png',168,168,true]);
    const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    expect(data[3]).toBe(0);expect(data[(84*info.width+84)*4+3]).toBe(255);
    hashes.push(crypto.createHash('sha256').update(bytes).digest('hex'));
  }
  expect(new Set(hashes).size).toBe(4);expect(external).toEqual([]);
  await page.screenshot({path:'artifacts/footballkitarchive/tier3-england-a-2026-09-24/studio-ready.png',fullPage:true});
});


test('Finnish calendar fallback and Romanian mixed seasons export independent team variants',async({page})=>{
  const external=[];
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!['localhost','127.0.0.1'].includes(new URL(r.url()).hostname))external.push(r.url());});
  await page.goto('/studio');
  const canvas=page.locator('.shirt-image'),card=page.getByRole('region',{name:'Applied kit details'});
  for(const [name,country,home,away] of [['FC Jazz','Finland','2025','2025'],['Sepsi OSK II','Romania','26-27','25-26'],['CS Tunari','Romania','25-26','25-26']]){
    await page.getByLabel('Team',{exact:true}).fill(name);
    await page.getByRole('button',{name:new RegExp(`${name} ${country}`)}).click();
    for(const [variant,season] of [['Home',home],['Away',away]]){
      await page.getByRole('button',{name:variant,exact:true}).click();
      await expect(canvas).toHaveAttribute('aria-label',`${name} ${variant.toLowerCase()} shirt`);
      await expect(canvas).toHaveAttribute('data-render-state','ready');
      await expect(card).toContainText(season);
      await page.getByRole('button',{name:'Add to collection',exact:true}).click();
    }
  }
  const tray=page.getByRole('region',{name:'Collection'}),downloads=[];
  await expect(tray.locator('.collection-item')).toHaveCount(6);
  await tray.getByLabel('Download size').selectOption('168');
  page.on('download',d=>downloads.push(d));
  await tray.getByRole('button',{name:'Download all',exact:true}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Yes, download'}).click();
  await expect.poll(()=>downloads.length).toBe(6);
  const fs=await import('node:fs/promises'),sharp=(await import('sharp')).default,crypto=await import('node:crypto');
  const hashes=[];
  for(const d of downloads){
    const bytes=await fs.readFile(await d.path()),meta=await sharp(bytes).metadata();
    expect([meta.format,meta.width,meta.height,meta.hasAlpha]).toEqual(['png',168,168,true]);
    const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    expect(data[3]).toBe(0);expect(data[(84*info.width+84)*4+3]).toBe(255);
    hashes.push(crypto.createHash('sha256').update(bytes).digest('hex'));
  }
  expect(new Set(hashes).size).toBe(6);expect(external).toEqual([]);
  await page.getByLabel('Team',{exact:true}).fill('TPV');
  await page.getByRole('button',{name:/TPV Finland/}).click();
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  await expect(card).toContainText('1999');
  await page.getByRole('button',{name:'Away',exact:true}).click();
  await expect(page.getByText('Away kit not available yet',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Add to collection',exact:true})).toBeDisabled();
});

test('historical fallback shirts show literal dates and export locally',async({page})=>{
  const external=[];
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!['localhost','127.0.0.1'].includes(new URL(r.url()).hostname))external.push(r.url());});
  await page.goto('/studio');
  const canvas=page.locator('.shirt-image'),card=page.getByRole('region',{name:'Applied kit details'});
  for(const [name,country,variant,season] of [['VJS','Finland','Home','2022'],['VJS','Finland','Away','2022'],['TPV','Finland','Home','1999'],['Acharnaikos','Greece','Away','83-84'],['CS Afumați','Romania','Away','25-26']]){
    await page.getByLabel('Team',{exact:true}).fill(name);
    await page.getByRole('button',{name:new RegExp(`${name} ${country}`)}).click();
    await page.getByRole('button',{name:variant,exact:true}).click();
    await expect(canvas).toHaveAttribute('aria-label',`${name} ${variant.toLowerCase()} shirt`);
    await expect(canvas).toHaveAttribute('data-render-state','ready');
    await expect(card).toContainText(season);
    await page.getByRole('button',{name:'Add to collection',exact:true}).click();
  }
  const tray=page.getByRole('region',{name:'Collection'}),downloads=[];
  await expect(tray.locator('.collection-item')).toHaveCount(5);
  await tray.getByLabel('Download size').selectOption('168');
  page.on('download',d=>downloads.push(d));
  await tray.getByRole('button',{name:'Download all',exact:true}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Yes, download'}).click();
  await expect.poll(()=>downloads.length).toBe(5);
  const fs=await import('node:fs/promises'),sharp=(await import('sharp')).default;
  for(const d of downloads){
    const bytes=await fs.readFile(await d.path()),meta=await sharp(bytes).metadata();
    expect([meta.format,meta.width,meta.height,meta.hasAlpha]).toEqual(['png',168,168,true]);
  }
  expect(external).toEqual([]);
  await page.screenshot({path:'artifacts/footballkitarchive/latest-available-2026-09-25/studio-historical-ready.png',fullPage:true});
});
