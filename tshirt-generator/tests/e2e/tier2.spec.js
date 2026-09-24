import {test,expect} from '@playwright/test';

test('Tier 2 reviewed variants apply offline with independent equipment and rejected drafts stay unavailable',async({page})=>{
 const external=[];
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!['localhost','127.0.0.1'].includes(new URL(r.url()).hostname))external.push(r.url());});
 await page.goto('/studio');
 const canvas=page.locator('.shirt-image'),card=page.getByRole('region',{name:'Applied kit details'});
 for(const [name,country,variant,brand]of [
  ['Birmingham City','England','Home','Nike'],['Birmingham City','England','Away','Nike'],
  ['1. FC Heidenheim','Germany','Away','Puma'],['Pisa','Italy','Away','adidas'],
  ['Chindia Târgoviște','Romania','Away','Nike'],
 ]){
  await page.getByLabel('Team',{exact:true}).fill(name);
  await page.getByRole('button',{name:new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')} ${country}`)}).click();
  await page.getByRole('button',{name:variant,exact:true}).click();
  await expect(canvas).toHaveAttribute('aria-label',`${name} ${variant.toLowerCase()} shirt`);
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  await expect(card).toContainText('26-27');await expect(card).toContainText(brand);
  await expect(page.getByRole('button',{name:'Add to collection',exact:true})).toBeEnabled();
 }
 await page.screenshot({path:'artifacts/footballkitarchive/tier2-studio-ready.png',fullPage:true});
 await page.getByRole('button',{name:'Home',exact:true}).click();
 await expect(canvas).toHaveAttribute('aria-label','Original PNG shirt');
 await expect(page.locator('.canvas-caption p')).toHaveText('Home kit not available yet');
 await expect(page.getByRole('button',{name:'Add to collection',exact:true})).toBeDisabled();
 expect(external).toEqual([]);
});
