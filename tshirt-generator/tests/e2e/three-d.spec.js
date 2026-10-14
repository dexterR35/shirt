import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

// Headless browsers need a software WebGL implementation.
test.use({ launchOptions: { args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] } });

// three.js, GSAP, the viewer and the mesh (the small pose module is part of the Studio).
const THREE_D = /\/assets\/3d\/|Shirt3DView|\/src\/lib\/shirt-3d\.js|\/assets\/shirt-3d-\w+\.js$|three|gsap/;

test("the 3D view loads nothing until it is switched on, then shows the default shirt", async ({ page }) => {
  const requests = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.goto("/studio");
  await expect(page.locator(".shirt-image")).toHaveAttribute("data-render-state", "ready");
  expect(requests.filter((url) => THREE_D.test(url))).toEqual([]);
  await expect(page.locator("canvas.shirt-3d-canvas")).toHaveCount(0);

  await page.getByRole("button", { name: "3D", exact: true }).click();
  const shirt = page.locator("canvas.shirt-3d-canvas");
  await expect(shirt).toHaveAttribute("data-render-state", "ready", { timeout: 60_000 });
  expect(requests.some((url) => /\/assets\/3d\/shirt-[\da-f]{12}\.glb$/.test(url))).toBe(true);
  await expect(shirt).toHaveAttribute("aria-label", /^Generic jersey on-dark · 3D,/);
  await expect(page.getByText("Generic fallback design · no team affiliation")).toBeVisible();
  // The flat view's zoom and thumbnails give way to the 3D camera bar.
  await expect(page.getByRole("group", { name: "Zoom" })).toHaveCount(0);
  await expect(page.getByRole("toolbar", { name: "3D camera" })).toBeVisible();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(shirt).toHaveCount(0);
  await expect(page.locator(".shirt-image")).toHaveAttribute("data-render-state", "ready");
});

test("a locked pose freezes the camera and every 3D download uses it", async ({ page }) => {
  await page.goto("/studio");
  await page.getByLabel("Team", { exact: true }).fill("Arsenal");
  await page.getByRole("button", { name: /Arsenal England/ }).click();
  await page.getByRole("button", { name: "3D", exact: true }).click();
  const shirt = page.locator("canvas.shirt-3d-canvas");
  await expect(shirt).toHaveAttribute("data-render-state", "ready", { timeout: 60_000 });
  await expect(shirt).toHaveAttribute("aria-label", /Arsenal home shirt · 3D/);

  const camera = page.getByRole("toolbar", { name: "3D camera" });
  await camera.getByRole("button", { name: "¾ right" }).click();
  await expect(shirt).toHaveAttribute("data-pose", JSON.stringify({ version: 1, azimuth: 35, elevation: 8, distance: 1.72 }));
  // Dragging orbits while unlocked...
  const box = await shirt.boundingBox();
  const drag = async () => {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2, { steps: 8 });
    await page.mouse.up();
  };
  await drag();
  await expect(shirt).not.toHaveAttribute("data-pose", /"azimuth":35,/);
  await camera.getByRole("button", { name: "¾ right" }).click();
  await expect(shirt).toHaveAttribute("data-pose", /"azimuth":35,/);
  // ...and does nothing once the pose is locked.
  await camera.getByRole("button", { name: "Lock", exact: true }).click();
  await expect(shirt).toHaveAttribute("data-locked", "true");
  await expect(camera.getByRole("button", { name: "Front" })).toBeDisabled();
  await drag();
  await page.waitForTimeout(500);
  await expect(shirt).toHaveAttribute("data-pose", JSON.stringify({ version: 1, azimuth: 35, elevation: 8, distance: 1.72 }));
  await expect(page.getByText("3D · 35° · 8° · LOCKED")).toBeVisible();

  // Download at a small size: square, transparent around an opaque shirt, named -3d.
  await page.getByRole("button", { name: "Add to collection", exact: true }).click();
  const tray = page.getByRole("region", { name: "Collection" });
  await tray.getByLabel("Download size").selectOption("512");
  await tray.getByRole("button", { name: "Download all", exact: true }).click();
  await expect(page.getByText(/3D view, same camera for every kit: 35° right · 8° up · 1\.72 m \(locked\)/)).toBeVisible();
  const pending = page.waitForEvent("download", { timeout: 120_000 });
  await page.getByRole("button", { name: "Yes, download" }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toMatch(/-home-r\d{3}-512px-3d\.png$/);
  const { data, info } = await sharp(await readFile(await download.path())).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  expect([info.width, info.height]).toEqual([512, 512]);
  const alpha = (x, y) => data[(y * info.width + x) * 4 + 3];
  expect(alpha(2, 2)).toBe(0);
  expect(alpha(256, 230)).toBe(255);

  // The 3D view and its locked pose survive a reload.
  await page.reload();
  await expect(page.locator("canvas.shirt-3d-canvas")).toHaveAttribute("data-locked", "true", { timeout: 60_000 });
  await expect(page.locator("canvas.shirt-3d-canvas")).toHaveAttribute("data-pose", /"azimuth":35,/);
});
