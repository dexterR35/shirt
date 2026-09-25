import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import sharp from 'sharp';
import {unzipSync} from 'fflate';

const raw=png=>sharp(png).ensureAlpha().raw().toBuffer();
const pixels=async canvas=>raw(Buffer.from((await canvas.evaluate(c=>c.toDataURL())).split(',')[1],'base64'));
function samePixels(actual,expected) {
  expect(actual.length).toBe(expected.length);
  let opaque=0,edge=0,alpha=0;
  for(let i=0;i<actual.length;i+=4){
    alpha=Math.max(alpha,Math.abs(actual[i+3]-expected[i+3]));
    for(let k=0;k<3;k++){
      const delta=Math.abs(actual[i+k]-expected[i+k]);
      if(expected[i+3]===255)opaque=Math.max(opaque,delta);else edge=Math.max(edge,delta);
    }
  }
  expect(alpha).toBe(0);expect(opaque).toBe(0);expect(edge).toBeLessThanOrEqual(1);
}

test('original base angles face inward, persist, and match individual and ZIP downloads',async({page})=>{
  const requests=[],errors=[];
  page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/studio');
  await page.getByLabel('Team',{exact:true}).fill('Arsenal');
  await page.getByRole('button',{name:/Arsenal England/}).click();
  const shirt=page.locator('.shirt-image'),views=page.getByRole('group',{name:'Shirt view'});
  await expect(shirt).toHaveAttribute('data-render-state','ready');
  const front=await pixels(shirt);
  await views.getByRole('button',{name:'Angled',exact:true}).click();
  await expect(shirt).toHaveAttribute('data-view','three-quarter');
  await expect(shirt).toHaveAttribute('data-facing','right');
  await expect(shirt).toHaveAttribute('data-render-state','ready');
  const home=await pixels(shirt);expect(home.equals(front)).toBe(false);
  await page.getByRole('button',{name:'Add to collection',exact:true}).click();
  const tray=page.getByRole('region',{name:'Collection'});
  await tray.getByLabel('Download size').selectOption('1024');
  await expect(tray.getByLabel('Download view')).toHaveValue('three-quarter');
  await tray.getByRole('button',{name:'Download Arsenal home',exact:true}).click();
  await expect(page.getByRole('dialog')).toContainText('Angled view');
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Yes, download'}).click();
  const download=await pending;expect(download.suggestedFilename()).toContain('-angled.png');
  samePixels(await raw(await readFile(await download.path())),home);
  await page.getByRole('button',{name:'Away',exact:true}).click();
  await expect(shirt).toHaveAttribute('data-facing','left');
  await expect(shirt).toHaveAttribute('data-render-state','ready');
  const away=await pixels(shirt);
  await page.getByRole('button',{name:'Add to collection',exact:true}).click();
  await tray.getByRole('button',{name:'ZIP all',exact:true}).click();
  const zipped=page.waitForEvent('download');await page.getByRole('button',{name:'Yes, download'}).click();
  const zip=unzipSync(await readFile(await (await zipped).path()));
  expect(Object.keys(zip)).toHaveLength(2);
  for(const [name,data]of Object.entries(zip))samePixels(await raw(Buffer.from(data)),name.includes('-home-')?home:away);
  await page.reload();await expect(shirt).toHaveAttribute('data-facing','left');
  await expect(shirt).toHaveAttribute('data-view','three-quarter');await expect(shirt).toHaveAttribute('data-render-state','ready');
  samePixels(await pixels(shirt),away);
  await page.getByRole('button',{name:'Home',exact:true}).click();
  await views.getByRole('button',{name:'Front',exact:true}).click();
  await expect(shirt).toHaveAttribute('data-render-state','ready');samePixels(await pixels(shirt),front);
  expect(requests.some(url=>url.includes('three-quarter-'))).toBe(false);
  expect(errors).toEqual([]);
});

test('angled editor selects the original collar, sleeves and body and changes their real pixels',async({page})=>{
  await page.goto('/studio');
  await page.getByRole('group',{name:'Shirt view'}).getByRole('button',{name:'Angled',exact:true}).click();
  const shirt=page.locator('.shirt-image');await expect(shirt).toHaveAttribute('data-render-state','ready');
  const ids=await page.evaluate(async()=>{
    const {partAt}=await import('/src/lib/png-preview.js');
    const {neutralConfig}=await import('/src/lib/shirt-renderer.js');
    const {perspectivePoint}=await import('/src/lib/perspective-shirt.js');
    const result=[];
    for(const facing of ['right','left'])for(const point of [[100,110],[30,60],[170,60],[100,23]]){
      const [u,v]=perspectivePoint(...point,facing);result.push(await partAt(neutralConfig(),u,v,'three-quarter',facing));
    }
    return result;
  });
  expect(ids).toEqual(['role:body','role:leftSleeve','role:rightSleeve','role:collar','role:body','role:leftSleeve','role:rightSleeve','role:collar']);
  const before=await pixels(shirt);
  await page.getByRole('button',{name:'Edit',exact:true}).click();
  await page.getByRole('button',{name:'Collar',exact:true}).click();
  await page.getByLabel('Collar color',{exact:true}).fill('#D12233');
  await expect(shirt).toHaveAttribute('data-render-state','ready');
  await page.getByRole('button',{name:'Save',exact:true}).click();
  const after=await pixels(shirt);expect(after.equals(before)).toBe(false);
  for(let i=3;i<before.length;i+=4)expect(after[i]).toBe(before[i]);
  await page.setViewportSize({width:390,height:844});
  const angled=page.getByRole('group',{name:'Shirt view'}).getByRole('button',{name:'Angled',exact:true});
  await angled.scrollIntoViewIfNeeded();await expect(angled).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('4096 angled export loads the 8000×5000 master and keeps a transparent complete garment',async({page})=>{
  test.setTimeout(60000);
  const requests=[];page.on('request',r=>requests.push(r.url()));await page.goto('/studio');
  const png=await page.evaluate(async()=>{
    const {renderImage}=await import('/src/lib/export.js');
    const blob=await renderImage(null,4096,'png','1:1',0,'three-quarter','left');
    return new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(blob);});
  });
  const bytes=Buffer.from(png.split(',')[1],'base64'),metadata=await sharp(bytes).metadata();
  expect(metadata.width).toBe(4096);expect(metadata.height).toBe(4096);expect(metadata.hasAlpha).toBe(true);
  const bounds=await sharp(bytes).extractChannel('alpha').trim().toBuffer({resolveWithObject:true});
  expect(bounds.info.width).toBeGreaterThan(1800);expect(bounds.info.height).toBeGreaterThan(3000);
  expect(requests.some(url=>url.includes('/assets/base/source-4670b8b8dd8d.png'))).toBe(true);
});
