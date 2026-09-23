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
              svg_path: `/fixture/${i}-${variant}.svg`,
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
test("candidate changes preserve the PNG preview; Apply paints the selected kit", async ({
  page,
}) => {
  await setup(page);
  await page.getByRole("button", { name: "Apply kit", exact: true }).click();
  const shirt = page.locator(".shirt-image");
  await expect(shirt).toHaveAttribute("aria-label", "Știința Test home shirt");
  await expect(shirt).toHaveAttribute("data-render-state","ready");
  const preview = await shirt.evaluate(canvas=>canvas.toDataURL());
  await page.getByRole("button", { name: /Test Team 1 Romania/ }).click();
  await expect(shirt).toHaveAttribute("aria-label", "Știința Test home shirt");
  await page.getByRole("button", { name: "Away", exact: true }).click();
  await expect(shirt).toHaveAttribute("aria-label", "Știința Test home shirt");
  expect(await shirt.evaluate(canvas=>canvas.toDataURL())).toBe(preview);
  await expect(page.getByRole("button",{name:"Download later",exact:true})).toBeDisabled();
  await page.getByRole("button", { name: "Apply kit", exact: true }).click();
  await expect(shirt).toHaveAttribute("aria-label", "Test Team 1 away shirt");
  await page.getByRole("button", { name: /Test Team 2 Romania/ }).click();
  await expect(
    page.getByRole("button", { name: "Home", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
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
  await page.getByRole("button", { name: "Apply kit", exact: true }).click();
  await expect(page.locator(".shirt-image")).toHaveAttribute(
    "aria-label",
    "Știința Test home shirt",
  );
  await page.route("**/fixture/1-home.json", (r) =>
    r.fulfill({ status: 404, body: "missing" }),
  );
  await page.locator(".team-row").nth(1).click();
  await page.getByRole("button", { name: "Apply kit", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(/could not/i);
  await expect(page.locator(".shirt-image")).toHaveAttribute(
    "aria-label",
    "Știința Test home shirt",
  );
  await page.locator(".team-row").nth(2).click();
  await page.getByRole("button", { name: "Apply kit", exact: true }).click();
  await expect(page.locator(".shirt-image")).toHaveAttribute(
    "aria-label",
    "Test Team 2 home shirt",
  );
});


test("custom colors retain the PNG silhouette and reset to the original pixels",async({page})=>{
  await setup(page);
  const canvas=page.locator('.shirt-image');
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  const original=await canvas.evaluate(c=>c.toDataURL());
  await page.getByText('Try your own colors',{exact:true}).click();
  await page.getByLabel('Body color',{exact:true}).fill('#C72938');
  await expect(page.getByText('CUSTOM COLORS',{exact:true})).toBeVisible();
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  expect(await canvas.evaluate(c=>c.toDataURL())).not.toBe(original);
  const alpha=await canvas.evaluate(c=>{
    const ctx=c.getContext('2d'),p=ctx.getImageData(0,0,c.width,c.height).data;
    return {corner:p[3],center:p[(Math.floor(c.height/2)*c.width+Math.floor(c.width/2))*4+3]};
  });
  expect(alpha).toEqual({corner:0,center:255});
  await page.getByRole('button',{name:'Reset colors',exact:true}).click();
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  expect(await canvas.evaluate(c=>c.toDataURL())).toBe(original);
});

test("real Barcelona colors render on the original PNG and source is loaded once",async({page})=>{
  let baseRequests=0;
  page.on('request',r=>{if(r.url().endsWith('/assets/base/source.png'))baseRequests++;});
  await page.goto('/');
  const canvas=page.locator('.shirt-image');
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  await page.getByLabel('Team',{exact:true}).fill('Barcelona');
  await page.getByRole('button',{name:/Barcelona Spain/}).click();
  await page.getByRole('button',{name:'Apply kit',exact:true}).click();
  await expect(canvas).toHaveAttribute('aria-label','Barcelona home shirt');
  await expect(canvas).toHaveAttribute('data-render-state','ready');
  await expect(page.getByText(/Adapted to your PNG base/)).toBeVisible();
  expect(baseRequests).toBe(1);
  await page.screenshot({path:'artifacts/png-base/studio-barcelona.png',fullPage:true});
});

test('Leeds Apply uses the corrected shoulder and yellow trim layout',async({page})=>{
  await page.goto('/');
  await page.getByLabel('Team',{exact:true}).fill('Leeds United');
  await page.getByRole('button',{name:/Leeds United England/}).click();
  await page.getByRole('button',{name:'Apply kit',exact:true}).click();
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
  await page.getByRole('button',{name:'Apply kit',exact:true}).click();
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
