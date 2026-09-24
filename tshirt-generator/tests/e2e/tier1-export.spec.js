import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { unzipSync } from "fflate";
import { tier1Items, tier1Filename } from "../../src/lib/tier1-export.js";

test("Tier 1 downloads all 276 actual PNGs at 168 square, independently of filters and collection", async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto("/studio");
  const manifest = await (await page.request.get("/catalog/manifest.json")).json();
  const expected = tier1Items(manifest.teams).map(tier1Filename);
  await page.getByLabel("Team", { exact: true }).fill("Arsenal");
  await page.getByRole("button", { name: /Arsenal England/ }).click();
  await page.getByRole("button", { name: "Add to collection", exact: true }).click();
  const tray = page.getByRole("region", { name: "Collection" });
  await tray.getByLabel("Download size").selectOption("168");
  await tray.getByRole("slider", { name: "Lighting", exact: true }).press("End");
  // The Tier 1 button always promises PNG, regardless of collection format.
  await tray.getByLabel("Download format").selectOption("webp");
  const button = tray.getByRole("button", { name: "Download all Tier 1 · PNG ZIP" });
  const dialog = page.getByRole("dialog");
  const downloads = [];
  page.on("download", (download) => downloads.push(download));
  await button.click();
  await expect(dialog).toContainText("138 teams, Home and Away: 276 PNG images at 168 × 168 px each");
  await expect(dialog).toContainText("Lighting: 200%.");
  await dialog.getByRole("button", { name: "No", exact: true }).click();
  expect(downloads).toHaveLength(0);
  await button.click();
  const downloaded = page.waitForEvent("download", { timeout: 150_000 });
  await dialog.getByRole("button", { name: "Yes, download" }).click();
  await expect(tray.getByLabel("Download size")).toBeDisabled();
  await expect(tray.getByRole("slider", { name: "Lighting", exact: true })).toBeDisabled();
  const zip = await downloaded;
  expect(zip.suggestedFilename()).toBe("tier-1-276-168x168-png.zip");
  const files = unzipSync(await readFile(await zip.path()));
  expect(Object.keys(files).sort()).toEqual(expected.sort());
  for (const data of Object.values(files)) {
    const png = Buffer.from(data);
    expect(png.subarray(1, 4).toString()).toBe("PNG");
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([168, 168]);
  }
  // Both ends of the full archive use the chosen fabric lighting, not the default.
  const expectedPixels = await page.evaluate(async (items) => {
    const { loadKit } = await import("/src/lib/kit-config.js");
    const { renderImage } = await import("/src/lib/export.js");
    return Promise.all(items.map(async (item) => {
      const { config } = await loadKit(item);
      return Array.from(new Uint8Array(await (await renderImage(config, 168, "png", "1:1", 200)).arrayBuffer()));
    }));
  }, [tier1Items(manifest.teams)[0], tier1Items(manifest.teams).at(-1)]);
  const orderedNames = tier1Items(manifest.teams).map(tier1Filename);
  expect(Buffer.from(files[orderedNames[0]])).toEqual(Buffer.from(expectedPixels[0]));
  expect(Buffer.from(files[orderedNames.at(-1)])).toEqual(Buffer.from(expectedPixels[1]));
  expect(downloads).toHaveLength(1);
  await expect(tray.locator(".collection-item")).toHaveCount(1);
  await expect(tray.getByLabel("Download size")).toBeEnabled();
  await expect(tray.getByLabel("Download format")).toHaveValue("webp");
});

test("Tier 1 export cancels from an empty collection and restores controls after a failed kit", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/studio");
  const tray = page.getByRole("region", { name: "Collection" });
  await tray.getByRole("button", { name: /Collection/ }).click();
  await tray.getByLabel("Download size").selectOption("256");
  await tray.getByLabel("Image shape").selectOption("9:16");
  const button = tray.getByRole("button", { name: "Download all Tier 1 · PNG ZIP" });
  const downloads = [];
  page.on("download", (download) => downloads.push(download));
  await button.click();
  await expect(page.getByRole("dialog")).toContainText("144 × 256 px each");
  await page.getByRole("button", { name: "Yes, download" }).click();
  await tray.getByRole("button", { name: "Cancel export" }).click();
  await expect(page.getByRole("status")).toContainText("export cancelled");
  expect(downloads).toHaveLength(0);
  await expect(button).toBeEnabled();
  await expect(tray.getByLabel("Download size")).toBeEnabled();
  await expect(tray.locator(".collection-item")).toHaveCount(0);
  // Fresh page clears the config cache; a failed request must not download a partial archive.
  await page.reload();
  await page.route("**/catalog/kits/*", (route) => route.fulfill({ status: 503, body: "Unavailable" }));
  await tray.getByRole("button", { name: /Collection/ }).click();
  await button.click();
  await page.getByRole("button", { name: "Yes, download" }).click();
  await expect(page.getByRole("status")).toContainText("No ZIP was downloaded");
  await expect(button).toBeEnabled();
  expect(downloads).toHaveLength(0);
});
