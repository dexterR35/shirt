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
test("all 735 real teams, accent search, unavailable exports and responsive layout", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText("735 TEAMS", { exact: true })).toBeVisible();
  await page
    .getByLabel("Country / association")
    .selectOption({ label: "Romania (134)" });
  await expect(page.getByText("134 TEAMS", { exact: true })).toBeVisible();
  await page.getByLabel("Team", { exact: true }).fill("zzzz-no-result");
  await expect(page.getByText("No teams found")).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(
    page.getByRole("button", { name: "Download later", exact: true }),
  ).toBeDisabled();
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
  await expect(page.getByRole("button",{name:"Download later",exact:true})).toBeDisabled();
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
  await expect(page.getByRole("button",{name:"Collection export later"})).toBeDisabled();
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

test('expanded country catalog applies independent Romanian Home/Away and shows missing drafts as unavailable',async({page})=>{
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
  await page.getByLabel('Team',{exact:true}).fill('Chindia');
  await page.getByRole('button',{name:/Chindia Târgoviște Romania/}).click();
  await expect(page.locator('.canvas-caption p')).toHaveText('Home kit not available yet');
  await expect(canvas).toHaveAttribute('aria-label','Original PNG shirt');
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

test('mandatory calendar-year teams stay visible without substituting 2026 for 2026/27',async({page})=>{
  await page.goto('/');
  await page.getByLabel('Team',{exact:true}).fill('AC Oulu');
  await page.getByRole('button',{name:/AC Oulu Finland/}).click();
  await expect(page.locator('.canvas-caption p')).toHaveText('Home kit not available yet');
  await page.getByRole('button',{name:'Away',exact:true}).click();
  await expect(page.locator('.canvas-caption p')).toHaveText('Away kit not available yet');
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
  // An unfinished draft is never painted; the plain base and a missing message are shown.
  await page.getByLabel('Team',{exact:true}).fill('Milan');
  await page.getByRole('button',{name:/Milan Italy/}).click();
  await page.getByRole('button',{name:'Away',exact:true}).click();
  await expect(page.locator('.canvas-caption p')).toHaveText('Away kit not available yet');
  await expect(canvas).toHaveAttribute('aria-label','Original PNG shirt');
  await expect(card).toContainText('Choose a team');
  expect(external).toEqual([]);
});

test('remaining-71 batch applies newly reviewed patterns and shows a draft as missing',async({page})=>{
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
  await page.getByLabel('Team',{exact:true}).fill('Crystal Palace');
  await page.getByRole('button',{name:/Crystal Palace England/}).click();
  await page.getByRole('button',{name:'Away',exact:true}).click();
  await expect(page.locator('.canvas-caption p')).toHaveText('Away kit not available yet');
  await expect(canvas).toHaveAttribute('aria-label','Original PNG shirt');
  await expect(card).toContainText('Choose a team');
  expect(external).toEqual([]);
});

test('remaining-42 revisions render with local equipment facts and show drafts as missing',async({page})=>{
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
  ]){
    await page.getByLabel('Team',{exact:true}).fill(team);
    await page.getByRole('button',{name:new RegExp(`${team} ${country}`)}).click();
    await page.getByRole('button',{name:'Away',exact:true}).click();
      await expect(canvas).toHaveAttribute('aria-label',`${team} away shirt`);
    await expect(canvas).toHaveAttribute('data-render-state','ready');
    await expect(card).toContainText('26-27');
    await page.screenshot({path:`artifacts/footballkitarchive/tier1-42-2026-09-23/studio-${team.toLowerCase()}.png`,fullPage:true});
  }
  await page.getByLabel('Team',{exact:true}).fill('Toulouse');
  await page.getByRole('button',{name:/Toulouse France/}).click();
  await page.getByRole('button',{name:'Away',exact:true}).click();
  await expect(page.locator('.canvas-caption p')).toHaveText('Away kit not available yet');
  await expect(canvas).toHaveAttribute('aria-label','Original PNG shirt');
  await expect(card).toContainText('Choose a team');
  expect(external).toEqual([]);
});

test('the preview zooms within limits, pans by dragging and recenters without repainting',async({page})=>{
  await setup(page);
  await page.getByRole('button',{name:/Știința Test Romania/}).click();
  const canvas=page.locator('.shirt-image'),level=page.locator('.zoom-controls span');
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  const pixels=await canvas.evaluate(c=>c.toDataURL());
  await expect(level).toHaveText('100%');
  await expect(page.getByRole('button',{name:'Center shirt'})).toBeDisabled();
  const stage=await page.locator('.shirt-stage').boundingBox();
  await page.mouse.move(stage.x+stage.width/2,stage.y+stage.height/2);
  await page.mouse.wheel(0,-400);
  await expect(level).toHaveText('100%');
  await page.keyboard.down('Control');
  await page.mouse.wheel(0,-400);
  await page.keyboard.up('Control');
  await expect(level).not.toHaveText('100%');
  await page.getByRole('button',{name:'Center shirt'}).click();
  for(let i=0;i<12&&await page.getByRole('button',{name:'Zoom in'}).isEnabled();i++)await page.getByRole('button',{name:'Zoom in'}).click();
  await expect(level).toHaveText('400%');
  await expect(page.getByRole('button',{name:'Zoom in'})).toBeDisabled();
  const box=await page.locator('.shirt-stage').boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await page.mouse.down();
  await page.mouse.move(box.x+box.width/2+60,box.y+box.height/2+30,{steps:5});
  await page.mouse.up();
  expect(await canvas.evaluate(c=>c.style.transform)).toContain('translate(60px, 30px)');
  await page.getByRole('button',{name:'Center shirt'}).click();
  await expect(level).toHaveText('100%');
  for(let i=0;i<12&&await page.getByRole('button',{name:'Zoom out'}).isEnabled();i++)await page.getByRole('button',{name:'Zoom out'}).click();
  await expect(level).toHaveText('50%');
  await expect(page.getByRole('button',{name:'Zoom out'})).toBeDisabled();
  expect(await canvas.evaluate(c=>c.toDataURL())).toBe(pixels);
});

test('edit mode fixes the view, selects parts by clicking the shirt, and keeps saved colors until reload',async({page})=>{
  await page.goto('/');
  await page.getByLabel('Team',{exact:true}).fill('Arsenal');
  await page.getByRole('button',{name:/Arsenal England/}).click();
  const canvas=page.locator('.shirt-image'),stage=page.locator('.shirt-stage');
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
  const pointAt=async(u,v)=>{const b=await canvas.boundingBox();return [b.x+b.width*(1/16+u/200*7/8),b.y+b.height*(1/16+v/200*7/8)];};
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
