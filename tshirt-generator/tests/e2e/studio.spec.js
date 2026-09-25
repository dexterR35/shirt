import { test, expect } from "@playwright/test";
import {neutralConfig} from "../../src/lib/shirt-renderer.js";
async function setup(page) {
  const countries = [{ id: "ro", name: "Romania", team_count: 7 }];
  const teams = Array.from({ length: 7 }, (_, i) => ({
    id: `test-${i}`,
    name: i === 0 ? "Știința Test" : `Test Team ${i}`,
    country_id: "ro",
    country_name: "Romania",
    kits: Object.fromEntries(
      ["home", "away"].map((variant) => [
        variant,
        i === 6
          ? { status: "researching", reason: "Reference pending" }
          : {
              status: "ready",
              kit_season: "2026/27",
              revision: "r001",
              details_path: `/fixture/${i}-${variant}.json`,
            },
      ]),
    ),
  }));
  await page.route("**/catalog/manifest.json", (r) =>
    r.fulfill({
      json: {
        counts: {
          teams: 7,
          countries: 1,
          slots: 14,
          ready: 12,
          discovery_searched: 14,
        },
        countries,
        teams,
      },
    }),
  );
  await page.route("**/fixture/*.json", (r) => {
    const [,i,variant]=new URL(r.request().url()).pathname.match(/(\d+)-(home|away)\.json$/);
    r.fulfill({json:{team_id:`test-${i}`,variant,revision:"r001",references:[],color_evidence:{basis:'Test fixture'},visual_review:{notes:'Test fixture'},config:neutralConfig(variant==='home'?'#D52838':'#1C56B0')}});
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your team. Its true colors." }),
  ).toBeVisible();
}
test("all 735 real teams, accent search and responsive layout", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".team-row")).toHaveCount(735);
  await page
    .getByLabel("Country / association")
    .selectOption({ label: "Romania (134)" });
  await expect(page.locator(".team-row")).toHaveCount(134);
  await page.getByLabel("Team", { exact: true }).fill("zzzz-no-result");
  await expect(page.getByText("No teams found")).toBeVisible();
  await page.getByLabel("Team", { exact: true }).fill("");
  await page.getByLabel("Country / association").selectOption({ label: "All countries" });
  await expect(page.locator(".team-row")).toHaveCount(735);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "artifacts/studio-mobile-tested.png",
    fullPage: true,
  });
});
test("the studio opens on the plain base; choosing a team or variant paints it at once and survives reload", async ({
  page,
}) => {
  await setup(page);
  const shirt = page.locator(".shirt-image");
  await expect(shirt).toHaveAttribute("aria-label", "Original PNG shirt");
  await page.getByRole("button", { name: /Știința Test Romania/ }).click();
  await expect(shirt).toHaveAttribute("aria-label", "Știința Test home shirt");
  await expect(shirt).toHaveAttribute("data-render-state","ready");
  const home = await shirt.evaluate(canvas=>canvas.toDataURL());
  await page.getByRole("button", { name: "Away", exact: true }).click();
  await expect(shirt).toHaveAttribute("aria-label", "Știința Test away shirt");
  await expect(shirt).toHaveAttribute("data-render-state","ready");
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await expect(shirt).toHaveAttribute("data-render-state","ready");
  expect(await shirt.evaluate(canvas=>canvas.toDataURL())).toBe(home);
  await page.getByRole("button", { name: /Test Team 2 Romania/ }).click();
  await expect(
    page.getByRole("button", { name: "Home", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(shirt).toHaveAttribute("aria-label", "Test Team 2 home shirt");
  await page.reload();
  await expect(shirt).toHaveAttribute("aria-label", "Test Team 2 home shirt");
  await expect(shirt).toHaveAttribute("data-render-state","ready");
});
test("ten selections, no truncation, independent Home/Away and synchronized navigation", async ({
  page,
}) => {
  await setup(page);
  for (let i = 0; i < 5; i++) {
    await page.locator(".team-row").nth(i).click();
    for (const variant of ["Home", "Away"]) {
      await page.getByRole("button", { name: variant, exact: true }).click();
      await page
        .getByRole("button", { name: "Add to collection", exact: true })
        .click();
    }
  }
  await expect(page.locator(".collection-item")).toHaveCount(10);
  await page.locator(".team-row").nth(5).click();
  await page
    .getByRole("button", { name: "Add to collection", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("full");
  await expect(page.locator(".collection-item")).toHaveCount(10);
  await page.getByRole("button", { name: "Next kit", exact: true }).click();
  await expect(page.locator(".shirt-image")).toHaveAttribute(
    "aria-label",
    "Știința Test home shirt",
  );
  await expect(page.getByRole("button",{name:"ZIP all",exact:true})).toBeEnabled();
  await page
    .getByRole("button", { name: "Remove Știința Test home", exact: true })
    .click();
  await expect(page.locator(".collection-item")).toHaveCount(9);
  await expect(page.locator(".shirt-image")).toHaveAttribute(
    "aria-label",
    "Știința Test away shirt",
  );
});
test("missing saved asset is recoverable and leaves the previous preview intact", async ({
  page,
}) => {
  await setup(page);
  await page.locator(".team-row").nth(0).click();
  await expect(page.locator(".shirt-image")).toHaveAttribute(
    "aria-label",
    "Știința Test home shirt",
  );
  await page.route("**/fixture/1-home.json", (r) =>
    r.fulfill({ status: 404, body: "missing" }),
  );
  await page.locator(".team-row").nth(1).click();
  await expect(page.getByRole("status")).toContainText(/could not/i);
  await expect(page.locator(".shirt-image")).toHaveAttribute(
    "aria-label",
    "Știința Test home shirt",
  );
  await page.locator(".team-row").nth(2).click();
  await expect(page.locator(".shirt-image")).toHaveAttribute(
    "aria-label",
    "Test Team 2 home shirt",
  );
});


test("edited colors retain the PNG silhouette and reset to the original pixels",async({page})=>{
  await setup(page);
  const canvas=page.locator('.shirt-image');
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  const original=await canvas.evaluate(c=>c.toDataURL());
  await page.getByRole('button',{name:'Edit',exact:true}).click();
  await page.getByLabel('Body color',{exact:true}).fill('#C72938');
  await page.getByRole('button',{name:'Save',exact:true}).click();
  await expect(page.locator('.edit-toggle.edited')).toHaveCount(1);
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  expect(await canvas.evaluate(c=>c.toDataURL())).not.toBe(original);
  const alpha=await canvas.evaluate(c=>{
    const ctx=c.getContext('2d'),p=ctx.getImageData(0,0,c.width,c.height).data;
    return {corner:p[3],center:p[(Math.floor(c.height/2)*c.width+Math.floor(c.width/2))*4+3]};
  });
  expect(alpha).toEqual({corner:0,center:255});
  await page.getByRole('button',{name:'Edit',exact:true}).click();
  await page.getByRole('button',{name:'Reset all',exact:true}).click();
  await page.getByRole('button',{name:'Save',exact:true}).click();
  await expect(page.locator('.edit-toggle.edited')).toHaveCount(0);
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  expect(await canvas.evaluate(c=>c.toDataURL())).toBe(original);
});

test("real Barcelona colors render on the 2048 base copy, loaded once, without downloading the 8K master",async({page})=>{
  let baseRequests=0,masterRequests=0;
  page.on('request',r=>{const path=new URL(r.url()).pathname;if(path.startsWith('/assets/base/preview-'))baseRequests++;if(path.startsWith('/assets/base/source-'))masterRequests++;});
  await page.goto('/');
  const canvas=page.locator('.shirt-image');
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  await page.getByLabel('Team',{exact:true}).fill('Barcelona');
  await page.getByRole('button',{name:/Barcelona Spain/}).click();
  await expect(canvas).toHaveAttribute('aria-label','Barcelona home shirt');
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  await expect(page.locator('.canvas-caption p')).toHaveText('Home');
  expect(baseRequests).toBe(1);
  expect(masterRequests).toBe(0);
  await page.screenshot({path:'artifacts/png-base/studio-barcelona.png',fullPage:true});
});

test('Leeds uses the corrected shoulder and yellow trim layout',async({page})=>{
  await page.goto('/');
  await page.getByLabel('Team',{exact:true}).fill('Leeds United');
  await page.getByRole('button',{name:/Leeds United England/}).click();
  const canvas=page.locator('.shirt-image');
  await expect(canvas).toHaveAttribute('aria-label','Leeds United home shirt');
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  const yellowCounts=await canvas.evaluate(c=>{
    const ctx=c.getContext('2d');
    return [[24,79,3,4],[98,18,4,3]].map(([x,y,w,h])=>{
      const scale=c.width*7/1600,margin=c.width/16;
      const pixels=ctx.getImageData(Math.floor(margin+x*scale),Math.floor(margin+y*scale),Math.ceil(w*scale),Math.ceil(h*scale)).data;
      let yellow=0;
      for(let i=0;i<pixels.length;i+=4)if(pixels[i]>pixels[i+2]*2&&pixels[i+1]>pixels[i+2]*2&&pixels[i+3]===255)yellow++;
      return yellow;
    });
  });
  for(const count of yellowCounts)expect(count).toBeGreaterThan(10);
  await page.screenshot({path:'artifacts/layout-correction/studio-leeds.png',fullPage:true});
});

test('Ipswich Away keeps one round PNG collar without a painted V on the chest',async({page})=>{
  await page.goto('/');
  await page.getByLabel('Team',{exact:true}).fill('Ipswich Town');
  await page.getByRole('button',{name:/Ipswich Town England/}).click();
  await page.getByRole('button',{name:'Away',exact:true}).click();
  const canvas=page.locator('.shirt-image');
  await expect(canvas).toHaveAttribute('aria-label','Ipswich Town away shirt');
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  const chest=await canvas.evaluate(c=>{
    const scale=c.width*7/1600,margin=c.width/16;
    return [...c.getContext('2d').getImageData(Math.floor(margin+100*scale),Math.floor(margin+29*scale),1,1).data];
  });
  expect(chest[0]).toBeGreaterThan(150);
  expect(chest[1]).toBeGreaterThan(140);
  await page.screenshot({path:'artifacts/collar-correction/studio-ipswich.png',fullPage:true});
});

test('new archive-sourced Manchester City kit applies',async({page})=>{
  await page.goto('/');
  await page.getByLabel('Team',{exact:true}).fill('Manchester City');
  await page.getByRole('button',{name:/Manchester City England/}).click();
  const canvas=page.locator('.shirt-image');
  await expect(canvas).toHaveAttribute('aria-label','Manchester City home shirt');
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  await page.screenshot({path:'artifacts/footballkitarchive/studio-manchester-city.png',fullPage:true});
});

test('expanded country catalog applies independent Romanian Home/Away and shows missing slots as unavailable',async({page})=>{
  await page.goto('/');
  await page.getByLabel('Team',{exact:true}).fill('FCSB');
  await page.getByRole('button',{name:/FCSB Romania/}).click();
  const canvas=page.locator('.shirt-image');
  await expect(canvas).toHaveAttribute('aria-label','FCSB home shirt');
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  const home=await canvas.evaluate(c=>c.toDataURL());
  await page.getByRole('button',{name:'Away',exact:true}).click();
  await expect(canvas).toHaveAttribute('aria-label','FCSB away shirt');
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  expect(await canvas.evaluate(c=>c.toDataURL())).not.toBe(home);
  await page.screenshot({path:'artifacts/footballkitarchive/studio-fcsb-away.png',fullPage:true});
  await page.getByLabel('Team',{exact:true}).fill('CSC Dumbrăvița');
  await page.getByRole('button',{name:/CSC Dumbrăvița Romania/}).click();
  await expect(page.locator('.canvas-caption p')).toHaveText('Home kit not available yet');
  await expect(canvas).toHaveAttribute('aria-label','Original PNG shirt');
  // The plain white base carries a "No preview" label; a ready kit never does.
  await expect(page.locator('.shirt-stage .no-preview')).toHaveText('No preview');
  await page.getByLabel('Team',{exact:true}).fill('FCSB');
  await page.getByRole('button',{name:/FCSB Romania/}).click();
  await expect(canvas).toHaveAttribute('aria-label','FCSB home shirt');
  await expect(page.locator('.shirt-stage .no-preview')).toHaveCount(0);
});

test('equipment details use local JSON and follow selection, collection navigation and edited colors',async({page})=>{
  const external=[];
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!['localhost','127.0.0.1'].includes(new URL(r.url()).hostname))external.push(r.url());});
  await page.goto('/');
  const card=page.getByRole('region',{name:'Applied kit details'});
  await expect(card).toContainText('Choose a team');
  await expect(page.getByText('BUILT FROM THE ORIGINAL',{exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'View original master'})).toHaveCount(0);
  await page.getByLabel('Team',{exact:true}).fill('Manchester United');
  await page.getByRole('button',{name:/Manchester United England/}).click();
  for(const value of ['Manchester United','26-27','Plain','Red / White / Black','adidas','Snapdragon','Premier League · Champions League','May 14, 2026'])await expect(card).toContainText(value);
  await page.getByRole('button',{name:'Add to collection',exact:true}).click();
  await page.getByRole('button',{name:'Away',exact:true}).click();
  await expect(card).toContainText('July 22, 2026');
  await expect(card).toContainText('Blue / White / Red');
  await page.getByRole('button',{name:'Add to collection',exact:true}).click();
  await page.getByRole('button',{name:'Previous kit',exact:true}).click();
  await expect(card).toContainText('May 14, 2026');
  await page.getByRole('button',{name:'Edit',exact:true}).click();
  await page.getByLabel('Body color',{exact:true}).fill('#00ff00');
  await page.getByRole('button',{name:'Save',exact:true}).click();
  await expect(card).toContainText('Custom colors preview');
  await expect(card).toContainText('Red / White / Black');
  await page.screenshot({path:'artifacts/footballkitarchive/studio-equipment-details.png',fullPage:true});
  expect(external).toEqual([]);
});

test('calendar-year Home and Away apply with their literal 2026 season',async({page})=>{
  await page.goto('/');
  await page.getByLabel('Team',{exact:true}).fill('AC Oulu');
  await page.getByRole('button',{name:/AC Oulu Finland/}).click();
  await expect(page.locator('.shirt-image')).toHaveAttribute('aria-label','AC Oulu home shirt');
  await expect(page.locator('.shirt-image')).toHaveAttribute('data-render-state','ready');
  await expect(page.getByRole('region',{name:'Applied kit details'})).toContainText('2026');
  await expect(page.getByRole('region',{name:'Applied kit details'})).not.toContainText('26-27');
  await page.getByRole('button',{name:'Away',exact:true}).click();
  await expect(page.locator('.shirt-image')).toHaveAttribute('aria-label','AC Oulu away shirt');
  await expect(page.locator('.shirt-image')).toHaveAttribute('data-render-state','ready');
  const yellow=await page.locator('.shirt-image').evaluate(c=>{const p=c.getContext('2d').getImageData(c.width*.5,c.height*.5,1,1).data;return p[0]>150&&p[1]>130&&p[2]<90;});
  expect(yellow).toBe(true);
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});

test('new Tier 1 detailed layouts apply locally while unfinished revisions show as missing',async({page})=>{
  const external=[];
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!['localhost','127.0.0.1'].includes(new URL(r.url()).hostname))external.push(r.url());});
  await page.goto('/');
  const canvas=page.locator('.shirt-image');
  const card=page.getByRole('region',{name:'Applied kit details'});
  for(const [team,country,source] of [
    ['Werder Bremen','Germany','https://www.footballkitarchive.com/werder-bremen-2026-27-away-kit-494873/'],
    ['Udinese','Italy','https://www.footballkitarchive.com/udinese-calcio-2026-27-away-kit-504723/'],
  ]){
    await page.getByLabel('Team',{exact:true}).fill(team);
    await page.getByRole('button',{name:new RegExp(`${team} ${country}`)}).click();
    await page.getByRole('button',{name:'Away',exact:true}).click();
      await expect(canvas).toHaveAttribute('aria-label',`${team} away shirt`);
    await expect(canvas).toHaveAttribute('data-render-state','ready');
    await expect(card).toContainText(team);
    await expect(card).toContainText('26-27');
    await page.screenshot({path:`artifacts/footballkitarchive/studio-tier1-${team.toLowerCase().replaceAll(' ','-')}.png`,fullPage:true});
  }
  // An unfinished slot is never painted; the plain base and a missing message are shown.
  await page.getByLabel('Team',{exact:true}).fill('CSC Dumbrăvița');
  await page.getByRole('button',{name:/CSC Dumbrăvița Romania/}).click();
  // This source slot remains unresearched and must show the plain base.
  await expect(page.locator('.canvas-caption p')).toHaveText('Home kit not available yet');
  await expect(canvas).toHaveAttribute('aria-label','Original PNG shirt');
  await expect(card).toContainText('Choose a team');
  expect(external).toEqual([]);
});

test('remaining-71 batch applies newly reviewed patterns and shows an unfinished slot as missing',async({page})=>{
  const external=[];
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!['localhost','127.0.0.1'].includes(new URL(r.url()).hostname))external.push(r.url());});
  await page.goto('/');
  const canvas=page.locator('.shirt-image'),card=page.getByRole('region',{name:'Applied kit details'});
  for(const [team,country,variant,source] of [
    ['Cagliari','Italy','Home','https://www.footballkitarchive.com/cagliari-calcio-2026-27-home-kit-499635/'],
    ['Manchester City','England','Away','https://www.footballkitarchive.com/manchester-city-2026-27-away-kit-486529/'],
    ['Monaco','France','Away','https://www.footballkitarchive.com/as-monaco-2026-27-away-kit-495691/'],
    ['OFI Crete','Greece','Away','https://www.footballkitarchive.com/ofi-crete-2026-27-away-kit-508199/'],
  ]){
    await page.getByLabel('Team',{exact:true}).fill(team);
    await page.getByRole('button',{name:new RegExp(`${team} ${country}`)}).click();
    await page.getByRole('button',{name:variant,exact:true}).click();
      await expect(canvas).toHaveAttribute('aria-label',`${team} ${variant.toLowerCase()} shirt`);
    await expect(canvas).toHaveAttribute('data-render-state','ready');
    await expect(card).toContainText('26-27');
    await page.screenshot({path:`artifacts/footballkitarchive/tier1-71-2026-09-23/studio-${team.toLowerCase().replaceAll(' ','-')}.png`,fullPage:true});
  }
  await page.getByLabel('Team',{exact:true}).fill('CSC Dumbrăvița');
  await page.getByRole('button',{name:/CSC Dumbrăvița Romania/}).click();
  await page.getByRole('button',{name:'Away',exact:true}).click();
  await expect(page.locator('.canvas-caption p')).toHaveText('Away kit not available yet');
  await expect(canvas).toHaveAttribute('aria-label','Original PNG shirt');
  await expect(card).toContainText('Choose a team');
  expect(external).toEqual([]);
});

test('remaining-42 revisions render with local equipment facts and show unfinished slots as missing',async({page})=>{
  const external=[];
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!['localhost','127.0.0.1'].includes(new URL(r.url()).hostname))external.push(r.url());});
  await page.goto('/');
  const canvas=page.locator('.shirt-image'),card=page.getByRole('region',{name:'Applied kit details'});
  for(const [team,country,source] of [
    ['Arsenal','England','arsenal-fc-2026-27-away-kit-441204'],
    ['Chelsea','England','chelsea-fc-2026-27-away-kit-514557'],
    ['Osasuna','Spain','ca-osasuna-2026-27-away-kit-496421'],
    ['Sassuolo','Italy','us-sassuolo-calcio-2026-27-away-kit-501416'],
    ['Monza','Italy','ac-monza-2026-27-away-kit-519841'],
    ['Kifisia','Greece','kifisia-fc-2026-27-away-kit-515391'],
    ['Toulouse','France','toulouse-fc-2026-27-away-kit-508724'],
  ]){
    await page.getByLabel('Team',{exact:true}).fill(team);
    await page.getByRole('button',{name:new RegExp(`${team} ${country}`)}).click();
    await page.getByRole('button',{name:'Away',exact:true}).click();
      await expect(canvas).toHaveAttribute('aria-label',`${team} away shirt`);
    await expect(canvas).toHaveAttribute('data-render-state','ready');
    await expect(card).toContainText('26-27');
    if(team==='Toulouse'){
      // Ready must describe Away pixels, not the preceding plain/Home preview.
      await expect.poll(()=>canvas.evaluate(c=>{
        const ctx=c.getContext('2d'),p=ctx.getImageData(c.width*.5,c.height*.4,1,1).data;
        return Math.min(p[0],p[1],p[2])>170;
      })).toBe(true);
    }
    const screenshotBatch=team==='Toulouse'?'tier1-refinement-2026-09-24':'tier1-42-2026-09-23';
    await page.screenshot({path:`artifacts/footballkitarchive/${screenshotBatch}/studio-${team.toLowerCase()}.png`,fullPage:true});
  }
  await page.getByLabel('Team',{exact:true}).fill('Union Berlin');
  await page.getByRole('button',{name:/Union Berlin Germany/}).click();
  await expect(canvas).toHaveAttribute('aria-label','Union Berlin home shirt');
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  await expect(card).toContainText('26-27');
  const unionPixels=await canvas.evaluate(c=>{
    const p=c.getContext('2d').getImageData(c.width*.5,c.height*.5,1,1).data;
    return p[0]>140&&p[0]>p[1]*2&&p[0]>p[2]*2;
  });
  expect(unionPixels).toBe(true);
  await page.screenshot({path:'artifacts/footballkitarchive/tier1-refinement-2026-09-24/studio-union-berlin.png',fullPage:true});
  await page.getByLabel('Team',{exact:true}).fill('CSC Dumbrăvița');
  await page.getByRole('button',{name:/CSC Dumbrăvița Romania/}).click();
  await expect(page.locator('.canvas-caption p')).toHaveText('Home kit not available yet');
  await expect(canvas).toHaveAttribute('aria-label','Original PNG shirt');
  await expect(card).toContainText('Choose a team');
  expect(external).toEqual([]);
});

test('Milan and Venezia Away load reviewed local layouts while a non-mandatory unfinished slot remains unavailable',async({page})=>{
  const external=[];
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!['localhost','127.0.0.1'].includes(new URL(r.url()).hostname))external.push(r.url());});
  await page.goto('/');
  const canvas=page.locator('.shirt-image'),card=page.getByRole('region',{name:'Applied kit details'});
  for(const team of ['Milan','Venezia']){
    await page.getByLabel('Team',{exact:true}).fill(team);
    await page.getByRole('button',{name:new RegExp(`${team} Italy`)}).click();
    await page.getByRole('button',{name:'Away',exact:true}).click();
    await expect(canvas).toHaveAttribute('aria-label',`${team} away shirt`);
    await expect(canvas).toHaveAttribute('data-render-state','ready');
    await expect(card).toContainText(team);
    await expect(card).toContainText('26-27');
    // Both Away fronts are pale; Milan's red Home must have finished switching.
    const pale=await canvas.evaluate(c=>{
      const p=c.getContext('2d').getImageData(c.width*.5,c.height*.5,1,1).data;
      return Math.min(p[0],p[1],p[2])>150;
    });
    expect(pale).toBe(true);
    await page.screenshot({path:`artifacts/footballkitarchive/tier1-ornaments-2026-09-24/studio-${team.toLowerCase()}.png`,fullPage:true});
  }
  await page.getByLabel('Team',{exact:true}).fill('CSC Dumbrăvița');
  await page.getByRole('button',{name:/CSC Dumbrăvița Romania/}).click();
  // This source slot remains unresearched.
  await expect(page.locator('.canvas-caption p')).toHaveText('Home kit not available yet');
  await expect(canvas).toHaveAttribute('aria-label','Original PNG shirt');
  await expect(card).toContainText('Choose a team');
  expect(external).toEqual([]);
});

test('the preview zooms with the buttons and Ctrl+scroll, can be dragged only when zoomed in, and never repaints',async({page})=>{
  await setup(page);
  await page.getByRole('button',{name:/Știința Test Romania/}).click();
  const canvas=page.locator('.shirt-image'),level=page.locator('.zoom-controls span');
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  const pixels=await canvas.evaluate(c=>c.toDataURL());
  await expect(level).toHaveText('100%');
  await expect(page.getByRole('button',{name:'Center shirt'})).toBeDisabled();
  const stage=await page.locator('.shirt-stage').boundingBox(),cx=stage.x+stage.width/2,cy=stage.y+stage.height/2;
  const drag=async(dx,dy)=>{await page.mouse.move(cx,cy);await page.mouse.down();await page.mouse.move(cx+dx,cy+dy,{steps:6});await page.mouse.up();};
  const offset=async()=>(await canvas.evaluate(c=>c.style.transform)).match(/translate\((-?[\d.]+)px, (-?[\d.]+)px\)/).slice(1).map(Number);
  // At 100% dragging does nothing: the shirt stays centered.
  await drag(120,60);
  expect(await canvas.evaluate(c=>c.style.transform)).toBe('translate(0px, 0px) scale(1)');
  // Plain scrolling does not zoom; Ctrl + scroll zooms toward the pointer.
  await page.mouse.move(cx+80,cy);
  await page.mouse.wheel(0,-400);
  await expect(level).toHaveText('100%');
  await page.keyboard.down('Control');
  await page.mouse.wheel(0,-400);
  await page.keyboard.up('Control');
  await expect(level).not.toHaveText('100%');
  const zoomed=await canvas.evaluate(c=>c.style.transform);
  expect(zoomed).not.toContain('translate(0px, 0px)');
  // Zoomed in, dragging moves the shirt by exactly the pointer movement.
  const [x0,y0]=await offset();
  await drag(120,60);
  const [x1,y1]=await offset();
  expect([Math.round(x1-x0),Math.round(y1-y0)]).toEqual([120,60]);
  // It can never be dragged out of sight: its center stays inside the stage.
  await drag(5000,5000);
  const [x2,y2]=await offset(),scale=Number((await level.textContent()).replace('%',''))/100;
  expect(x2).toBeLessThanOrEqual(stage.width*scale/2+1);
  expect(y2).toBeLessThanOrEqual(stage.height*scale/2+1);
  // The arrow keys move it too.
  await page.locator('.shirt-stage').focus();
  await page.keyboard.press('ArrowRight');
  const [x3]=await offset();
  expect(Math.round(x2-x3)).toBe(40);
  // Buttons, limits and centering.
  for(let i=0;i<12&&await page.getByRole('button',{name:'Zoom in'}).isEnabled();i++)await page.getByRole('button',{name:'Zoom in'}).click();
  await expect(level).toHaveText('400%');
  await expect(page.getByRole('button',{name:'Zoom in'})).toBeDisabled();
  await page.getByRole('button',{name:'Center shirt'}).click();
  await expect(level).toHaveText('100%');
  expect(await canvas.evaluate(c=>c.style.transform)).toBe('translate(0px, 0px) scale(1)');
  for(let i=0;i<12&&await page.getByRole('button',{name:'Zoom out'}).isEnabled();i++)await page.getByRole('button',{name:'Zoom out'}).click();
  await expect(level).toHaveText('50%');
  await expect(page.getByRole('button',{name:'Zoom out'})).toBeDisabled();
  // At 100% or less the shirt is always centered.
  expect(await canvas.evaluate(c=>c.style.transform)).toContain('translate(0px, 0px)');
  expect(await canvas.evaluate(c=>c.toDataURL())).toBe(pixels);
});

test('edit mode fixes the view, selects parts by clicking the shirt, and keeps saved colors until reload',async({page})=>{
  await page.goto('/');
  await page.getByLabel('Team',{exact:true}).fill('Arsenal');
  await page.getByRole('button',{name:/Arsenal England/}).click();
  const canvas=page.locator('.shirt-image'),stage=page.locator('.shirt-stage');
  await expect(canvas).toHaveAttribute('aria-label','Arsenal home shirt');
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  const original=await canvas.evaluate(c=>c.toDataURL());
  await page.getByRole('button',{name:'Zoom in'}).click();
  await page.getByRole('button',{name:'Edit',exact:true}).click();
  const modal=page.getByRole('dialog',{name:'Edit colors'});
  await expect(modal).toBeVisible();
  // Sleeves fully covered by Arsenal's sleeve panels are not offered.
  await expect(modal.getByRole('button',{name:'Left sleeve'})).toHaveCount(0);
  // The editor window can be dragged by its title bar but never leaves the screen.
  const head=modal.locator('.modal-head'),start=await modal.boundingBox(),hb=await head.boundingBox();
  await page.mouse.move(hb.x+40,hb.y+hb.height/2);
  await page.mouse.down();
  await page.mouse.move(hb.x-260,hb.y+hb.height/2+120,{steps:6});
  await page.mouse.up();
  const moved=await modal.boundingBox();
  expect(Math.round(moved.x)).toBe(Math.round(start.x-300));
  expect(Math.round(moved.y)).toBe(Math.round(start.y+120));
  await page.mouse.move(hb.x-260,hb.y+hb.height/2+120);
  await page.mouse.down();
  await page.mouse.move(-500,-500,{steps:6});
  await page.mouse.up();
  const clamped=await modal.boundingBox();
  expect(clamped.x).toBe(8);
  expect(clamped.y).toBe(8);
  // Edit mode resets and disables zoom.
  await expect(page.locator('.zoom-controls')).toHaveCount(0);
  expect(await canvas.evaluate(c=>c.style.transform)).toContain('scale(1)');
  // Click the chest (200-unit point 100,110) and a sleeve (35,60): each selects its own part.
  // The canvas is drawn with object-fit: contain, so find the square shirt area inside its box.
  const pointAt=async(u,v)=>{const b=await canvas.boundingBox(),side=Math.min(b.width,b.height),x=b.x+(b.width-side)/2,y=b.y+(b.height-side)/2;
    return [x+side*(1/16+u/200*7/8),y+side*(1/16+v/200*7/8)];};
  await page.mouse.click(...await pointAt(100,110));
  await expect(modal.getByRole('button',{name:/^Body/})).toHaveAttribute('aria-pressed','true');
  // Hovering a part shows a hand cursor and the outline overlay; outside the shirt it does not.
  await page.mouse.move(...await pointAt(30,62));
  await expect(stage).toHaveClass(/over-part/);
  expect(await stage.evaluate(e=>getComputedStyle(e).cursor)).toBe('pointer');
  await expect.poll(()=>page.locator('.part-highlight').evaluate(c=>{
    const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return n;
  })).toBeGreaterThan(100);
  await page.mouse.move(...await pointAt(2,190));
  await expect(stage).not.toHaveClass(/over-part/);
  await page.mouse.click(...await pointAt(30,62));
  const sleevePart=modal.locator('.part-option[aria-pressed="true"]');
  await expect(sleevePart).not.toHaveText(/^Body/);
  await page.mouse.click(...await pointAt(100,110));
  await page.getByLabel('Body color',{exact:true}).fill('#1144aa');
  await page.getByRole('button',{name:'Save',exact:true}).click();
  await expect(modal).toHaveCount(0);
  await expect(page.locator('.zoom-controls')).toHaveCount(1);
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  const edited=await canvas.evaluate(c=>c.toDataURL());
  expect(edited).not.toBe(original);
  // Saved edits survive switching kits in this session.
  await page.getByRole('button',{name:'Away',exact:true}).click();
  await expect(canvas).toHaveAttribute('aria-label','Arsenal away shirt');
  await page.getByRole('button',{name:'Home',exact:true}).click();
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  expect(await canvas.evaluate(c=>c.toDataURL())).toBe(edited);
  // Cancel discards unsaved changes.
  await page.getByRole('button',{name:'Edit',exact:true}).click();
  await page.getByLabel('Body color',{exact:true}).fill('#ffff00');
  await page.getByRole('button',{name:'Cancel',exact:true}).click();
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  expect(await canvas.evaluate(c=>c.toDataURL())).toBe(edited);
  // A refresh restores the saved team kit without the edits.
  await page.reload();
  await expect(canvas).toHaveAttribute('aria-label','Arsenal home shirt');
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  expect(await canvas.evaluate(c=>c.toDataURL())).toBe(original);
});

test('stars review each shirt: 4-5 is perfect, 1-3 opens feedback; badges and reloads follow',async({page})=>{
  await page.goto('/');
  const stars=page.getByRole('radiogroup',{name:'Rating'}),status=page.locator('.review-status'),feedback=page.locator('.feedback-form');
  // Without a kit there is nothing to review.
  await expect(stars.getByRole('radio').first()).toBeDisabled();
  // Sample JSON: Arsenal Home 5 stars (perfect), Leeds Home 3 stars with feedback.
  await page.getByLabel('Team',{exact:true}).fill('Arsenal');
  await page.getByRole('button',{name:/Arsenal England/}).click();
  await expect(status).toHaveText('✓ Perfect (sample)');
  await expect(stars.getByRole('radio',{name:'5 stars'})).toHaveAttribute('aria-checked','true');
  await expect(feedback).toHaveCount(0);
  await expect(page.locator('.team-row',{hasText:'Arsenal'}).locator('.team-badge')).toHaveAttribute('aria-label','1 of 2 shirts rated perfect');
  await page.getByLabel('Team',{exact:true}).fill('Leeds United');
  await page.getByRole('button',{name:/Leeds United England/}).click();
  await expect(status).toHaveText('Needs changes (sample)');
  await expect(feedback.locator('textarea')).toHaveValue(/shoulder tapes look too thin/);
  await expect(page.locator('.team-row',{hasText:'Leeds United'}).locator('.team-badge.needs-changes')).toHaveText('★3');
  // An unreviewed shirt: 2 stars opens the feedback box; saving keeps the note.
  await page.getByLabel('Team',{exact:true}).fill('Chelsea');
  await page.getByRole('button',{name:/Chelsea England/}).click();
  await expect(status).toHaveText('Not rated yet');
  await stars.getByRole('radio',{name:'2 stars'}).click();
  await expect(status).toHaveText('Needs changes');
  await expect(page.getByRole('button',{name:'Save feedback'})).toBeDisabled();
  await feedback.locator('textarea').fill('Collar should be navy');
  await page.getByRole('button',{name:'Save feedback'}).click();
  await expect(feedback).toContainText('Feedback saved');
  await expect(page.locator('.team-row',{hasText:'Chelsea'}).locator('.team-badge.needs-changes')).toBeVisible();
  // Raising it to 4 stars makes it perfect and hides the feedback box.
  await stars.getByRole('radio',{name:'4 stars'}).click();
  await expect(status).toHaveText('✓ Perfect');
  await expect(feedback).toHaveCount(0);
  // Away is a separate shirt with its own rating.
  await page.getByRole('button',{name:'Away',exact:true}).click();
  await expect(status).toHaveText('Not rated yet');
  await stars.getByRole('radio',{name:'1 star'}).click();
  await feedback.locator('textarea').fill('Wrong sleeve color');
  await page.getByRole('button',{name:'Save feedback'}).click();
  // Saved in this browser: still there after a reload.
  await page.reload();
  await expect(status).toHaveText('Needs changes');
  await expect(feedback.locator('textarea')).toHaveValue('Wrong sleeve color');
  await page.getByRole('button',{name:'Home',exact:true}).click();
  await expect(status).toHaveText('✓ Perfect');
  await expect(stars.locator('button.on')).toHaveCount(4);
});

test('the collection tray downloads queued kits as sized PNG/WebP files or one ZIP, each after a yes/no question',async({page})=>{
  await page.goto('/');
  const tray=page.getByRole('region',{name:'Collection'});
  // Docked bottom-right, collapsed until something is added.
  await expect(tray.getByRole('button',{name:'ZIP all'})).toHaveCount(0);
  for(const team of ['Arsenal','Chelsea']){
    await page.getByLabel('Team',{exact:true}).fill(team);
    await page.getByRole('button',{name:new RegExp(`${team} England`)}).click();
    await page.getByRole('button',{name:'Add to collection',exact:true}).click();
  }
  await expect(tray.locator('.collection-item')).toHaveCount(2);
  const box=await tray.boundingBox(),vp=page.viewportSize();
  expect(Math.round(box.x+box.width)).toBe(vp.width-20);
  expect(Math.round(box.y+box.height)).toBe(vp.height-20);
  await tray.getByLabel('Download size').selectOption('168');
  const fs=await import('node:fs/promises');
  const dialog=page.getByRole('dialog');
  const downloads=[];
  page.on('download',d=>downloads.push(d));
  // "No" cancels: nothing is downloaded.
  await tray.getByRole('button',{name:'Download all',exact:true}).click();
  await expect(dialog).toContainText('Download 2 kits?');
  await expect(dialog).toContainText('2 separate PNG images, 168 × 168 px each.');
  await dialog.getByRole('button',{name:'No'}).click();
  await expect(dialog).toHaveCount(0);
  // "Yes": one PNG per kit, at the chosen size.
  await tray.getByRole('button',{name:'Download all',exact:true}).click();
  await dialog.getByRole('button',{name:'Yes, download'}).click();
  await expect.poll(()=>downloads.length).toBe(2);
  for(const d of downloads){
    expect(d.suggestedFilename()).toMatch(/-(home)-r\d{3}-168px\.png$/);
    const png=await fs.readFile(await d.path());
    expect(png.subarray(1,4).toString()).toBe('PNG');
    expect([png.readUInt32BE(16),png.readUInt32BE(20)]).toEqual([168,168]);
  }
  // One kit on its own, as lossless WebP.
  await tray.getByLabel('Download format').selectOption('webp');
  await tray.getByRole('button',{name:'Download Arsenal home'}).click();
  await expect(dialog).toContainText('Download Arsenal Home?');
  const [webp]=await Promise.all([page.waitForEvent('download'),dialog.getByRole('button',{name:'Yes, download'}).click()]);
  expect(webp.suggestedFilename()).toMatch(/arsenal-.*-home-r\d{3}-168px\.webp$/);
  const webpBytes=await fs.readFile(await webp.path());
  expect(webpBytes.subarray(8,12).toString()).toBe('WEBP');
  // Lossless: the image chunk is VP8L (lossy would be "VP8 "), inside the extended VP8X container.
  const chunks=[];
  for(let at=12;at+8<=webpBytes.length;at+=8+webpBytes.readUInt32LE(at+4)+(webpBytes.readUInt32LE(at+4)&1))chunks.push(webpBytes.subarray(at,at+4).toString());
  expect(chunks).toContain('VP8L');
  expect(chunks).not.toContain('VP8 ');
  // Or both in one ZIP.
  await tray.getByRole('button',{name:'ZIP all'}).click();
  await expect(dialog).toContainText('Download 2 kits as one ZIP?');
  const [zip]=await Promise.all([page.waitForEvent('download'),dialog.getByRole('button',{name:'Yes, download'}).click()]);
  expect(zip.suggestedFilename()).toBe('tshirt-kits-2-168px-webp.zip');
  const bytes=await fs.readFile(await zip.path());
  expect(bytes.subarray(0,2).toString()).toBe('PK');
  expect(bytes.toString('latin1')).toContain('arsenal');
  expect(bytes.toString('latin1')).toContain('chelsea');
  expect(bytes.toString('latin1')).toContain('168px.webp');
  // Other shapes and small sizes: 9:16 at 256 px is 144 × 256, the shirt whole and centered.
  await tray.getByLabel('Download size').selectOption('256');
  await tray.getByLabel('Image shape').selectOption('9:16');
  await tray.getByLabel('Download format').selectOption('png');
  await tray.getByRole('button',{name:'Download Chelsea home'}).click();
  await expect(dialog).toContainText('One PNG image, 144 × 256 px.');
  const [story]=await Promise.all([page.waitForEvent('download'),dialog.getByRole('button',{name:'Yes, download'}).click()]);
  expect(story.suggestedFilename()).toMatch(/chelsea-.*-home-r\d{3}-144x256px\.png$/);
  const storyPng=await fs.readFile(await story.path());
  expect([storyPng.readUInt32BE(16),storyPng.readUInt32BE(20)]).toEqual([144,256]);
  // AVIF, encoded in the render worker: an AVIF file with the requested size.
  await tray.getByLabel('Download format').selectOption('avif');
  await tray.getByRole('button',{name:'Download Chelsea home'}).click();
  await expect(dialog).toContainText('One AVIF image, 144 × 256 px.');
  await expect(dialog).toContainText('a tenth of the PNG size');
  const [avif]=await Promise.all([page.waitForEvent('download'),dialog.getByRole('button',{name:'Yes, download'}).click()]);
  expect(avif.suggestedFilename()).toMatch(/chelsea-.*-home-r\d{3}-144x256px\.avif$/);
  const avifBytes=await fs.readFile(await avif.path());
  expect(avifBytes.subarray(4,12).toString()).toBe('ftypavif');
  const ispe=avifBytes.indexOf('ispe');
  expect([avifBytes.readUInt32BE(ispe+8),avifBytes.readUInt32BE(ispe+12)]).toEqual([144,256]);
  // Rendering and encoding ran in workers, not on the page.
  expect(page.workers().length).toBeGreaterThan(0);
});

test('catalog tabs show competitions in a sortable, searchable table; selected shirts go to the collection',async({page})=>{
  await page.goto('/');
  await page.getByRole('link',{name:/Catalog/}).click();
  const table=page.getByRole('table',{name:'Premier League'});
  await expect(table.locator('tbody tr')).toHaveCount(40);
  // Shirt pictures render as rows come into view.
  await expect(table.locator('.kit-thumb[data-state="ready"]').first()).toBeVisible();
  // Search across team, brand, colors.
  await page.getByLabel('Search Premier League').fill('Bournemouth');
  await expect(table.locator('tbody tr')).toHaveCount(2);
  await page.getByLabel('Search Premier League').fill('Hummel');
  const hummel=table.locator('tbody tr');
  expect(await hummel.count()).toBeGreaterThan(0);
  for(const text of await hummel.allInnerTexts())expect(text).toContain('Hummel');
  await page.getByLabel('Search Premier League').fill('');
  // Sorting by team, descending.
  await table.getByRole('button',{name:'Team'}).click();
  await table.getByRole('button',{name:'Team'}).click();
  await expect(table.locator('th[aria-sort="descending"]')).toHaveCount(1);
  const names=await table.locator('.cell-team strong').allInnerTexts();
  expect(names).toEqual([...names].sort((a,b)=>b.localeCompare(a)));
  // Switching competitions in the side list changes the table and clears the selection.
  await page.getByRole('button',{name:'Romania'}).click();
  const liga=page.getByRole('table',{name:'SuperLiga'});
  await expect(liga.locator('tbody tr')).toHaveCount(32);
  await expect(liga.locator('tr.unavailable')).toHaveCount(0);
  // Tier 1 is complete. The wider Liga II catalog still contains unfinished slots.
  await page.getByRole('button',{name:'Liga II 22',exact:true}).click();
  const liga2=page.getByRole('table',{name:'Liga II'});
  // Shirts that are not ready cannot be selected.
  await expect(liga2.locator('tr.unavailable input[type="checkbox"]').first()).toBeDisabled();
  // Shirts that are not ready show the plain base with a "No preview" label.
  await expect(liga2.locator('tr.unavailable .no-preview').first()).toHaveText('No preview');
  await expect(liga2.locator('tr:not(.unavailable) .no-preview')).toHaveCount(0);
  await page.getByRole('button',{name:'SuperLiga 16',exact:true}).click();
  // Selecting more than the free slots is refused, never truncated.
  await liga.getByRole('checkbox',{name:'Select all'}).check();
  await expect(page.getByRole('button',{name:/^Add \d+ to collection$/})).toBeDisabled();
  await liga.getByRole('checkbox',{name:'Select all'}).uncheck();
  const rows=liga.locator('tbody tr:not(.unavailable)');
  for(let i=0;i<3;i++)await rows.nth(i).getByRole('checkbox').check();
  await expect(page.getByText('3 selected · 10 of 10 collection slots free')).toBeVisible();
  await page.getByRole('button',{name:'Add 3 to collection'}).click();
  const tray=page.getByRole('region',{name:'Collection'});
  await expect(tray.locator('.collection-item')).toHaveCount(3);
  await expect(page.getByRole('status')).toContainText('3 shirts added');
  await expect(liga.locator('tr.selected')).toHaveCount(0);
  await expect(page.getByText('0 selected · 7 of 10 collection slots free')).toBeVisible();
});

test('routes: Studio is one page, catalog tabs have paths, breadcrumbs follow what is shown',async({page})=>{
  await page.goto('/');
  await expect(page).toHaveURL(/\/studio$/);
  await expect(page.locator('.breadcrumb')).toHaveText('Studio');
  // Choosing a team or variant changes the breadcrumb, not the URL (no history entry per click).
  await page.getByLabel('Team',{exact:true}).fill('Arsenal');
  await page.getByRole('button',{name:/Arsenal England/}).click();
  await page.getByRole('button',{name:'Away',exact:true}).click();
  await expect(page).toHaveURL(/\/studio$/);
  await expect(page.locator('.breadcrumb li')).toHaveText(['Studio','England','Arsenal','Away']);
  await expect(page.locator('.breadcrumb [aria-current="page"]')).toHaveText('Away');
  // Catalog routes, breadcrumb links and browser history.
  await page.getByRole('link',{name:/Catalog/}).click();
  await expect(page).toHaveURL(/\/catalog\/england\/premier-league$/);
  await expect(page.locator('.breadcrumb li')).toHaveText(['Catalog','England','Premier League']);
  await page.getByRole('button',{name:/EFL Championship/}).click();
  await expect(page).toHaveURL(/\/catalog\/england\/efl-championship$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/premier-league$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/studio$/);
  await expect(page.locator('.shirt-image')).toHaveAttribute('aria-label','Arsenal away shirt');
  // A refresh reopens the same kit.
  await page.reload();
  await expect(page.locator('.shirt-image')).toHaveAttribute('aria-label','Arsenal away shirt');
  // Deep catalog links open directly; unknown paths fall back to a valid page.
  await page.goto('/catalog/romania/liga-ii');
  await expect(page.getByRole('table',{name:'Liga II'})).toBeVisible();
  await page.goto('/catalog/nowhere');
  await expect(page).toHaveURL(/\/catalog\/england\/premier-league$/);
  await page.goto('/studio/some/old/link');
  await expect(page).toHaveURL(/\/studio$/);
});

test('switching teams does not flicker the buttons',async({page})=>{
  await page.goto('/studio');
  await page.getByLabel('Team',{exact:true}).fill('Arsenal');
  await page.getByRole('button',{name:/Arsenal England/}).click();
  await expect(page.locator('.shirt-image')).toHaveAttribute('data-render-state','ready');
  // Record any moment the Add / Edit buttons become disabled while switching kits.
  await page.evaluate(()=>{
    window.__flicker=0;
    const watch=el=>new MutationObserver(()=>{if(el.disabled)window.__flicker++;}).observe(el,{attributes:true,attributeFilter:['disabled']});
    watch(document.querySelector('.add-button'));watch(document.querySelector('.edit-toggle'));
  });
  for(const v of ['Away','Home','Away'])await page.getByRole('button',{name:v,exact:true}).click();
  await page.getByLabel('Team',{exact:true}).fill('Chelsea');
  await page.getByRole('button',{name:/Chelsea England/}).click();
  await expect(page.locator('.shirt-image')).toHaveAttribute('aria-label','Chelsea home shirt');
  expect(await page.evaluate(()=>window.__flicker)).toBe(0);
});

test('the sidebar is fixed at the left edge, collapses to icons (remembered) and shows the design team account',async({page})=>{
  await page.goto('/studio');
  const rail=page.locator('.rail');
  let box=await rail.boundingBox();
  expect([box.x,box.y,box.width]).toEqual([0,0,220]);
  await expect(page.getByRole('button',{name:'Account: Design team'})).toBeVisible();
  await page.getByRole('button',{name:'Collapse sidebar'}).click();
  await expect.poll(async()=>(await rail.boundingBox()).width).toBe(72);
  await expect(page.locator('.rail .rail-text').first()).toBeHidden();
  await expect(page.getByRole('link',{name:'Catalog'})).toBeVisible();
  await page.reload();
  await expect.poll(async()=>(await rail.boundingBox()).width).toBe(72);
  // The account stays pinned to the bottom of the rail.
  const account=await page.getByRole('button',{name:'Account: Design team'}).boundingBox();
  expect(account.y+account.height).toBeGreaterThan(page.viewportSize().height-40);
  await page.getByRole('button',{name:'Expand sidebar'}).click();
  await expect.poll(async()=>(await rail.boundingBox()).width).toBe(220);
});

test('the view bar shows live Front and Angled thumbnails; Side remains unavailable',async({page})=>{
  await page.goto('/studio');
  await page.getByLabel('Team',{exact:true}).fill('Arsenal');
  await page.getByRole('button',{name:/Arsenal England/}).click();
  await expect(page.locator('.shirt-image')).toHaveAttribute('data-render-state','ready');
  const views=page.getByRole('group',{name:'Shirt view'});
  await expect(views.getByRole('button')).toHaveCount(3);
  await expect(views.getByRole('button',{name:/Front/})).toHaveAttribute('aria-pressed','true');
  await expect(views.getByRole('button',{name:/Side/})).toBeDisabled();
  await expect(views.getByRole('button',{name:/Angled/})).toBeEnabled();
  // The front thumbnail copies the rendered shirt (red Arsenal body in its middle).
  await expect.poll(()=>views.locator('.view-thumb[data-view=front]').evaluate(c=>{const d=c.getContext('2d').getImageData(64,70,1,1).data;return d[0]>150&&d[1]<80;})).toBe(true);
});

test('canvas background: transparent shows a checkerboard, white is white, custom uses the picked color',async({page})=>{
  await page.goto('/studio');
  const canvas=page.locator('.canvas'),bg=()=>canvas.evaluate(e=>getComputedStyle(e).backgroundColor);
  await expect(page.getByRole('button',{name:'Transparent background'})).toHaveAttribute('aria-pressed','true');
  const checker=()=>canvas.evaluate(e=>getComputedStyle(e).backgroundImage);
  expect(await checker()).toContain('linear-gradient');
  await page.getByRole('button',{name:'White background'}).click();
  expect(await bg()).toBe('rgb(255, 255, 255)');
  expect(await checker()).toBe('none');
  await expect(canvas).toHaveClass(/on-light/);
  await page.getByLabel('Custom background color').fill('#3b1f57');
  expect(await bg()).toBe('rgb(59, 31, 87)');
  await expect(canvas).not.toHaveClass(/on-light/);
  await page.getByLabel('Custom background color').fill('#f2c94c');
  await expect(canvas).toHaveClass(/on-light/);
  await page.getByRole('button',{name:'Transparent background'}).click();
  expect(await checker()).toContain('linear-gradient');
});

test('completed Tier 1 shirts and explicit season fallbacks apply from local JSON',async({page})=>{
  const external=[];
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!['localhost','127.0.0.1'].includes(new URL(r.url()).hostname))external.push(r.url());});
  await page.goto('/');
  const canvas=page.locator('.shirt-image'),card=page.getByRole('region',{name:'Applied kit details'});
  for(const[team,country,variant,season]of [
    ['Real Sociedad','Spain','Home','26-27'],['Real Sociedad','Spain','Away','26-27'],
    ['Lorient','France','Home','26-27'],['Lorient','France','Away','26-27'],
    ['Bayer Leverkusen','Germany','Away','26-27'],['Petrolul Ploiești','Romania','Away','25-26'],
    ['Panetolikos','Greece','Away','26-27'],
  ]){
    await page.getByLabel('Team',{exact:true}).fill(team);
    await page.getByRole('button',{name:new RegExp(`${team} ${country}`)}).click();
    await page.getByRole('button',{name:variant,exact:true}).click();
    await expect(canvas).toHaveAttribute('aria-label',`${team} ${variant.toLowerCase()} shirt`);
    await expect(canvas).toHaveAttribute('data-render-state','ready');
    await expect(card).toContainText(season);await expect(card).toContainText(team);
    if(team==='Petrolul Ploiești'){await expect(card).toContainText('MrBit');await expect(card).not.toContainText('26-27');}
    await page.screenshot({path:`artifacts/footballkitarchive/tier1-completion-2026-09-24/studio-${team.toLowerCase().replaceAll(' ','-')}-${variant.toLowerCase()}.png`,fullPage:true});
  }
  expect(external).toEqual([]);
});
