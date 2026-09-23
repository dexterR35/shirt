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
  await expect(page.getByText("735 TEAMS", { exact: true })).toBeVisible();
  await page
    .getByLabel("Country / association")
    .selectOption({ label: "Romania (134)" });
  await expect(page.getByText("134 TEAMS", { exact: true })).toBeVisible();
  await page.getByLabel("Team", { exact: true }).fill("zzzz-no-result");
  await expect(page.getByText("No teams found")).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
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
  await expect(page.getByRole("button",{name:"ZIP",exact:true})).toBeEnabled();
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

test('the preview zooms with the buttons and Ctrl+scroll only, cannot be dragged, and never repaints',async({page})=>{
  await setup(page);
  await page.getByRole('button',{name:/Știința Test Romania/}).click();
  const canvas=page.locator('.shirt-image'),level=page.locator('.zoom-controls span');
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  const pixels=await canvas.evaluate(c=>c.toDataURL());
  await expect(level).toHaveText('100%');
  await expect(page.getByRole('button',{name:'Center shirt'})).toBeDisabled();
  const stage=await page.locator('.shirt-stage').boundingBox(),cx=stage.x+stage.width/2,cy=stage.y+stage.height/2;
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
  // Dragging does nothing.
  await page.mouse.move(cx,cy);
  await page.mouse.down();
  await page.mouse.move(cx+120,cy+60,{steps:6});
  await page.mouse.up();
  expect(await canvas.evaluate(c=>c.style.transform)).toBe(zoomed);
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

test('each shirt has its own 1-5 star rating, one-time approval and denial notes, kept across reloads',async({page})=>{
  await page.goto('/');
  const approve=page.getByRole('checkbox'),stars=page.getByRole('radiogroup',{name:'Rating'});
  // Without a kit there is nothing to review.
  await expect(approve).toBeDisabled();
  // Sample JSON: Arsenal Home approved with 5 stars, Leeds Home denied with a note.
  await page.getByLabel('Team',{exact:true}).fill('Arsenal');
  await page.getByRole('button',{name:/Arsenal England/}).click();
  await expect(approve).toBeChecked();
  await expect(approve).toBeDisabled();
  await expect(page.getByText('Approved (sample)')).toBeVisible();
  await expect(stars.getByRole('radio',{name:'5 stars'})).toHaveAttribute('aria-checked','true');
  await page.getByLabel('Team',{exact:true}).fill('Leeds United');
  await page.getByRole('button',{name:/Leeds United England/}).click();
  await expect(page.locator('.deny-note')).toContainText('shoulder tapes look too thin');
  // Team badges in the list come from the shirt reviews.
  await expect(page.locator('.team-row',{hasText:'Leeds United'}).locator('.team-badge.denied')).toContainText('★ 3');
  await page.getByLabel('Team',{exact:true}).fill('Arsenal');
  await expect(page.locator('.team-row',{hasText:'Arsenal'}).locator('.team-badge')).toHaveAttribute('aria-label','1 of 2 shirts approved');
  // A kit nobody reviewed: rate it, try to deny without a note, then approve once.
  await page.getByLabel('Team',{exact:true}).fill('Chelsea');
  await page.getByRole('button',{name:/Chelsea England/}).click();
  await expect(approve).not.toBeChecked();
  await stars.getByRole('radio',{name:'4 stars'}).click();
  await expect(stars.locator('button.on')).toHaveCount(4);
  await page.getByRole('button',{name:'Deny',exact:true}).click();
  await expect(page.getByRole('button',{name:'Save denial'})).toBeDisabled();
  await page.getByRole('button',{name:'Cancel',exact:true}).click();
  await approve.check();
  await expect(approve).toBeDisabled();
  // Away is a separate shirt with its own review.
  await page.getByRole('button',{name:'Away',exact:true}).click();
  await expect(approve).not.toBeChecked();
  await expect(stars.locator('button.on')).toHaveCount(0);
  await page.getByRole('button',{name:'Deny',exact:true}).click();
  await page.getByPlaceholder(/shoulder stripes/).fill('Collar should be navy');
  await page.getByRole('button',{name:'Save denial'}).click();
  await expect(page.locator('.deny-note')).toContainText('Collar should be navy');
  await expect(page.getByRole('button',{name:'Denied',exact:true})).toBeVisible();
  await expect(page.locator('.team-row',{hasText:'Chelsea'}).locator('.team-badge.denied')).toContainText('★ 4');
  // Saved in this browser: still there after a reload.
  await page.reload();
  await expect(page.locator('.deny-note')).toContainText('Collar should be navy');
  await page.getByRole('button',{name:'Home',exact:true}).click();
  await expect(approve).toBeChecked();
  await expect(stars.locator('button.on')).toHaveCount(4);
});

test('the collection tray downloads queued kits as sized PNGs or one ZIP',async({page})=>{
  await page.goto('/');
  const tray=page.getByRole('region',{name:'Collection'});
  // Docked bottom-right, collapsed until something is added.
  await expect(tray.getByRole('button',{name:'ZIP'})).toHaveCount(0);
  for(const team of ['Arsenal','Chelsea']){
    await page.getByLabel('Team',{exact:true}).fill(team);
    await page.getByRole('button',{name:new RegExp(`${team} England`)}).click();
    await page.getByRole('button',{name:'Add to collection',exact:true}).click();
  }
  await expect(tray.locator('.collection-item')).toHaveCount(2);
  const box=await tray.boundingBox(),vp=page.viewportSize();
  expect(Math.round(box.x+box.width)).toBe(vp.width-20);
  expect(Math.round(box.y+box.height)).toBe(vp.height-20);
  await tray.getByLabel('Download size').selectOption('512');
  const fs=await import('node:fs/promises');
  // One PNG per kit, at the chosen size.
  const pngs=[];
  page.on('download',d=>pngs.push(d));
  await tray.getByRole('button',{name:'Download'}).click();
  await expect.poll(()=>pngs.length).toBe(2);
  for(const d of pngs){
    expect(d.suggestedFilename()).toMatch(/-(home)-r\d{3}-512px\.png$/);
    const png=await fs.readFile(await d.path());
    expect(png.subarray(1,4).toString()).toBe('PNG');
    expect([png.readUInt32BE(16),png.readUInt32BE(20)]).toEqual([512,512]);
  }
  // Or both in one ZIP.
  const [zip]=await Promise.all([page.waitForEvent('download'),tray.getByRole('button',{name:'ZIP'}).click()]);
  expect(zip.suggestedFilename()).toBe('tshirt-kits-2-512px.zip');
  const bytes=await fs.readFile(await zip.path());
  expect(bytes.subarray(0,2).toString()).toBe('PK');
  expect(bytes.toString('latin1')).toContain('arsenal');
  expect(bytes.toString('latin1')).toContain('chelsea');
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
  // Switching tabs changes the competition and clears the selection.
  await page.getByRole('tab',{name:'Romania'}).click();
  const liga=page.getByRole('table',{name:'SuperLiga'});
  await expect(liga.locator('tbody tr')).toHaveCount(32);
  // Shirts that are not ready cannot be selected.
  await expect(liga.locator('tr.unavailable input[type="checkbox"]').first()).toBeDisabled();
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

test('routes: pages are children of the layout, the URL follows the kit and competition, breadcrumbs match',async({page})=>{
  await page.goto('/');
  await expect(page).toHaveURL(/\/studio$/);
  await expect(page.locator('.breadcrumb')).toHaveText('Studio');
  // Choosing a team and variant updates the URL and breadcrumb.
  await page.getByLabel('Team',{exact:true}).fill('Arsenal');
  await page.getByRole('button',{name:/Arsenal England/}).click();
  await expect(page).toHaveURL(/\/studio\/team_6c3ac1a8babfe2f2338b\/home$/);
  await page.getByRole('button',{name:'Away',exact:true}).click();
  await expect(page).toHaveURL(/\/away$/);
  await expect(page.locator('.breadcrumb li')).toHaveText(['Studio','England','Arsenal','Away']);
  await expect(page.locator('.breadcrumb [aria-current="page"]')).toHaveText('Away');
  // Catalog routes, breadcrumb links and browser history.
  await page.getByRole('link',{name:/Catalog/}).click();
  await expect(page).toHaveURL(/\/catalog\/england\/premier-league$/);
  await expect(page.locator('.breadcrumb li')).toHaveText(['Catalog','England','Premier League']);
  await page.getByRole('tab',{name:/EFL Championship/}).click();
  await expect(page).toHaveURL(/\/catalog\/england\/efl-championship$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/premier-league$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/away$/);
  await expect(page.locator('.shirt-image')).toHaveAttribute('aria-label','Arsenal away shirt');
  // Deep links open directly; unknown ones fall back to a valid page.
  await page.goto('/catalog/romania/liga-ii');
  await expect(page.getByRole('table',{name:'Liga II'})).toBeVisible();
  await page.goto('/catalog/nowhere');
  await expect(page).toHaveURL(/\/catalog\/england\/premier-league$/);
  await page.goto('/studio/team_6c3ac1a8babfe2f2338b/away');
  await expect(page.locator('.shirt-image')).toHaveAttribute('aria-label','Arsenal away shirt');
  await page.goto('/studio/team_missing/home');
  await expect(page).toHaveURL(/\/studio$/);
  await page.goto('/anything-else');
  await expect(page).toHaveURL(/\/studio$/);
});

test('the sidebar is fixed at the left edge, collapses to icons (remembered) and shows the demo account',async({page})=>{
  await page.goto('/studio');
  const rail=page.locator('.rail');
  let box=await rail.boundingBox();
  expect([box.x,box.y,box.width]).toEqual([0,0,280]);
  await expect(page.getByRole('button',{name:'Account: Demo reviewer'})).toBeVisible();
  await page.getByRole('button',{name:'Collapse sidebar'}).click();
  await expect.poll(async()=>(await rail.boundingBox()).width).toBe(72);
  await expect(page.locator('.rail .rail-text').first()).toBeHidden();
  await expect(page.getByRole('link',{name:'Catalog'})).toBeVisible();
  await page.reload();
  await expect.poll(async()=>(await rail.boundingBox()).width).toBe(72);
  // The account stays pinned to the bottom of the rail.
  const account=await page.getByRole('button',{name:'Account: Demo reviewer'}).boundingBox();
  expect(account.y+account.height).toBeGreaterThan(page.viewportSize().height-40);
  await page.getByRole('button',{name:'Expand sidebar'}).click();
  await expect.poll(async()=>(await rail.boundingBox()).width).toBe(280);
});
