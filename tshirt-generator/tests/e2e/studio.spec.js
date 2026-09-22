import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { unzipSync, strFromU8 } from "fflate";
const fixtureSvg = await readFile(
  "public/assets/shirts/original-master.svg",
  "utf8",
);
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
              details_path: "/fixture/details.json",
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
  await page.route("**/fixture/*.svg", (r) =>
    r.fulfill({ contentType: "image/svg+xml", body: fixtureSvg }),
  );
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
    page.getByRole("button", { name: "Download SVG", exact: true }),
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
test("candidate changes do not replace the applied kit; preview and downloaded SVG are byte-identical", async ({
  page,
}) => {
  await setup(page);
  await page.getByRole("button", { name: "Apply kit", exact: true }).click();
  const shirt = page.locator(".shirt-image");
  await expect(shirt).toHaveAttribute("alt", "Știința Test home shirt");
  const preview = await shirt.evaluate(async (img) =>
    (await fetch(img.src)).text(),
  );
  await page.getByRole("button", { name: /Test Team 1 Romania/ }).click();
  await expect(shirt).toHaveAttribute("alt", "Știința Test home shirt");
  await page.getByRole("button", { name: "Away", exact: true }).click();
  await expect(shirt).toHaveAttribute("alt", "Știința Test home shirt");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download SVG", exact: true }).click();
  const download = await downloadPromise;
  expect(await readFile(await download.path(), "utf8")).toBe(preview);
  await page.getByRole("button", { name: "Apply kit", exact: true }).click();
  await expect(shirt).toHaveAttribute("alt", "Test Team 1 away shirt");
  await page.getByRole("button", { name: /Test Team 2 Romania/ }).click();
  await expect(
    page.getByRole("button", { name: "Home", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
test("ten selections, no truncation, Home/Away slots, synchronized navigation, ZIP manifest", async ({
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
    "alt",
    "Știința Test home shirt",
  );
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download collection/ }).click();
  const download = await downloadPromise;
  const entries = unzipSync(await readFile(await download.path()));
  expect(Object.keys(entries)).toHaveLength(11);
  const manifest = JSON.parse(strFromU8(entries["manifest.json"]));
  expect(manifest).toHaveLength(10);
  expect(manifest[0].variant).toBe("home");
  expect(manifest[1].variant).toBe("away");
  expect(strFromU8(entries[manifest[0].filename])).toBe(fixtureSvg);
  await page
    .getByRole("button", { name: "Remove Știința Test home", exact: true })
    .click();
  await expect(page.locator(".collection-item")).toHaveCount(9);
  await expect(page.locator(".shirt-image")).toHaveAttribute(
    "alt",
    "Știința Test away shirt",
  );
});
test("missing saved asset is recoverable and leaves the previous preview intact", async ({
  page,
}) => {
  await setup(page);
  await page.getByRole("button", { name: "Apply kit", exact: true }).click();
  await expect(page.locator(".shirt-image")).toHaveAttribute(
    "alt",
    "Știința Test home shirt",
  );
  await page.route("**/fixture/1-home.svg", (r) =>
    r.fulfill({ status: 404, body: "missing" }),
  );
  await page.locator(".team-row").nth(1).click();
  await page.getByRole("button", { name: "Apply kit", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("could not be loaded");
  await expect(page.locator(".shirt-image")).toHaveAttribute(
    "alt",
    "Știința Test home shirt",
  );
  await page.locator(".team-row").nth(2).click();
  await page.getByRole("button", { name: "Apply kit", exact: true }).click();
  await expect(page.locator(".shirt-image")).toHaveAttribute(
    "alt",
    "Test Team 2 home shirt",
  );
});
