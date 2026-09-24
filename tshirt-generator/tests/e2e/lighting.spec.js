import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

const raw = (png) => sharp(png).ensureAlpha().raw().toBuffer();

function expectMatchingPixels(actual, expected) {
  expect(actual.length).toBe(expected.length);
  let opaqueDifference = 0, edgeDifference = 0, alphaDifference = 0;
  for (let i = 0; i < actual.length; i += 4) {
    alphaDifference = Math.max(alphaDifference, Math.abs(actual[i + 3] - expected[i + 3]));
    for (let channel = 0; channel < 3; channel++) {
      const delta = Math.abs(actual[i + channel] - expected[i + channel]);
      if (expected[i + 3] === 255) opaqueDifference = Math.max(opaqueDifference, delta);
      else edgeDifference = Math.max(edgeDifference, delta);
    }
  }
  expect(alphaDifference).toBe(0);
  expect(opaqueDifference).toBe(0);
  // Canvas.toDataURL and OffscreenCanvas PNG encoding round unpremultiplied
  // colors at translucent edges differently by at most one channel level.
  expect(edgeDifference).toBeLessThanOrEqual(1);
}

test("lighting changes real preview pixels and downloads, preserves alpha, persists and resets", async ({ page }, testInfo) => {
  await page.goto("/studio");
  await page.getByLabel("Team", { exact: true }).fill("Arsenal");
  await page.getByRole("button", { name: /Arsenal England/ }).click();
  await page.getByRole("button", { name: "Add to collection", exact: true }).click();
  const preview = page.locator(".shirt-image");
  const studio = page.locator(".preview-panel");
  const tray = page.getByRole("region", { name: "Collection" });
  const slider = studio.getByRole("slider", { name: "Lighting", exact: true });
  await tray.getByLabel("Download size").selectOption("1024");
  const capture = async () => {
    await expect(preview).toHaveAttribute("data-render-state", "ready");
    return raw(Buffer.from((await preview.evaluate((c) => c.toDataURL())).split(",")[1], "base64"));
  };
  const download = async () => {
    await tray.getByRole("button", { name: "Download Arsenal home", exact: true }).click();
    const pending = page.waitForEvent("download");
    await page.getByRole("button", { name: "Yes, download" }).click();
    return raw(await readFile(await (await pending).path()));
  };
  const before = await capture();
  expect(await preview.evaluate((c) => c.width)).toBe(1024);
  expectMatchingPixels(await download(), before);
  await slider.press("End");
  await expect(slider).toHaveValue("200");
  await expect(tray.getByRole("slider", { name: "Lighting", exact: true })).toHaveValue("200");
  const after = await capture();
  expectMatchingPixels(await download(), after);
  let lifted = 0, changedAlpha = 0;
  for (let i = 0; i < before.length; i += 4) {
    if (after[i + 3] !== before[i + 3]) changedAlpha++;
    if (before[i + 3] === 255 && after[i] > before[i]) lifted++;
  }
  expect(lifted).toBeGreaterThan(10_000);
  expect(changedAlpha).toBe(0);
  // Collection ZIP uses the same lighting as the individual download.
  await tray.getByRole("button", { name: "ZIP all", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Lighting: 200%.");
  const zipDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Yes, download" }).click();
  const { unzipSync } = await import("fflate");
  const files = unzipSync(await readFile(await (await zipDownload).path()));
  expectMatchingPixels(await raw(Buffer.from(Object.values(files)[0])), after);
  await page.reload();
  await expect(slider).toHaveValue("200");
  expect((await capture()).equals(after)).toBe(true);
  await studio.getByRole("button", { name: "Reset lighting", exact: true }).click();
  expect((await capture()).equals(before)).toBe(true);
  // Mobile control remains usable without horizontal overflow.
  await page.setViewportSize({ width: 390, height: 844 });
  await slider.scrollIntoViewIfNeeded();
  await expect(slider).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: testInfo.outputPath("lighting-mobile.png") });
});
