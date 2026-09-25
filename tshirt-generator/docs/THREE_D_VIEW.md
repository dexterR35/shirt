# 3D view — feature branch `feature/3d-view` (25 September 2026)

The user asked for a three.js 3D view of the base t-shirt on a separate branch: switched on with a button in the same Studio canvas, nothing rendered or downloaded until it is on, kit colors and shapes from the existing JSON, correct lighting, high quality, and a camera pose that can be locked and exported. This branch starts from `main` at `6cbcf60a`; the uncommitted angled-view work on `main` is not part of it.

## What the user sees

- **3D** toggle next to **Edit** in the Studio canvas. Off by default. While off, the app requests no three.js code, no GSAP and no mesh (checked by `tests/e2e/three-d.spec.js`). The 3D view stays on for the browser tab (sessionStorage), like the chosen kit.
- The same canvas, backgrounds (transparent/white/custom), Lighting slider, Home/Away switch, team list, color editor and collection. The 3D shirt is drawn on a transparent WebGL canvas, square like downloads, so the framing on screen is the framing that exports.
- Drag to orbit, scroll or pinch to zoom (no panning: the shirt stays centered). The camera bar on the left (where the flat view thumbnails sit) has **Front, ¾ right, Side, Back, ¾ left**, **Lock**, **Reset** and **Download 3D image**. Angle changes glide with GSAP (instant with reduced motion).
- **Lock** freezes the camera: dragging, zooming, angle buttons and reset are disabled, and the pose is remembered in this browser (localStorage) together with the lock. The canvas label reads e.g. `3D · 35° · 8° · LOCKED`.
- **Export at the same position**: with the 3D view on, every download — the camera bar's button, a collection kit, **Download all** and **ZIP all** — renders in 3D at the current pose, taken once at the start so a whole collection shares exactly the same angle. Sizes, image shapes (1:1, 4:5, 16:9, 9:16), PNG/WebP/AVIF, lighting and saved color edits work as for flat downloads; files end in `-3d` (e.g. `…-home-r001-2048px-3d.png`). The confirmation names the pose (`35° right · 8° up · 1.72 m (locked)`). The dev-only Tier ZIPs stay flat front images and say so.
- For kits the caption adds *3D preview · back and sides continue the front design*, because only the front is source-reviewed.

## Mesh

`data/model.glb` is the user's image-to-3D (Tripo3D) model of `base.png`: a hollow shirt with real neck, sleeve and hem openings and fabric thickness, 765,903 triangles, 24 MB, facing +X. It is kept byte-identical (SHA-256 `67864b18…f2df`). `npm run model:prepare` (`scripts/prepare-3d-model.mjs`, about 10 s) writes `public/assets/3d/shirt-<hash>.glb` and `manifest.json`:

1. Bakes the node scale and turns the shirt to face +Z (meters, up +Y).
2. **Registers the front silhouette to `base.png`**: an orthographic mask of the mesh is fitted to the PNG's alpha in the existing 200-unit paint grid (affine, coordinate descent). IoU **98.46%**; the remaining differences are sub-unit edges and the back collar, which rises above the front neckline. The fit is stored in the manifest and every point gets paint UVs (`TEXCOORD_0`) by projecting its (x, y) through it.
3. Keeps the source's own UVs as `TEXCOORD_1` for its baked texture, used only as fabric/stitch detail, normalized to its area-weighted mean (0.7729).
4. Adds `_FACING` (front +1 / back −1, from a Taubin-smoothed copy so folds do not flicker) and `_SIDE` (0–1 side-panel weight, see below).
5. Simplifies to 229,769 triangles, quantizes and meshopt-compresses: **2.8 MB** including a 2048 JPEG detail texture. Content-named and cached as immutable (`vercel.json`). The browser checks the byte count and, in secure contexts, the SHA-256 against the manifest before use.

A changed source file stops the script until it is inspected and its hash updated (`--accept-source` prints the new hash).

## Paint

The paint is the same validated SVG as the 2D preview (`renderColorArtwork`), rasterized at 2048 (4096 for downloads of 2048 px and more). No new kit data exists or is claimed.

- **Front** uses the kit's own paint, including the sewn round collar exactly as in 2D.
- **Back** uses the same paint with the neckline replaced by the collar's back ring (`BACK_NECK_RING` in `png-collar.js`, measured on the mesh: the rib's top edge runs from v 0.6 beside the neck to v 3 at the center back, about 5 units / 2 cm deep). `renderColorArtwork(config)` output is unchanged; `{side: 'back'}` is new.
- **Side panels.** A straight front-to-back projection draws contour lines across fabric that turns sideways, so stripes wobble, split and merge on the mesh's folded sides. Five unwrapping approaches were tried (smoothed-surface projection, harmonic and Poisson fields, geodesic and ellipse arc length); with these AI-generated folds none kept thin pinstripes clean. The shipped approach mirrors a real jersey's side panel: torso fabric turned sideways, within 20 paint units of the torso edge and below the armpit, shows **one column of the design**, chosen per kit at runtime as the column just inside the torso edge that best matches the most common color there. Hoops therefore wrap all the way round; vertical stripes become a clean panel (white on Newcastle, blue/red on Barcelona). Print and panel crossfade as colors.

## Lighting and quality

- `MeshPhysicalMaterial`: roughness 0.78, polyester sheen, ambient occlusion and a normalized multiply of the source texture's stitching and folds (the 3D counterpart of the 2D paint × PNG multiply).
- Studio light rig that moves with the camera (every angle is lit like a product photo): key light with soft PCF shadows (2048 map on screen, 4096 in downloads), fill, rim, and a PMREM room environment.
- Khronos PBR Neutral tone mapping keeps team colors true; the Lighting slider (−100…100) is exposure (±1 stop).
- Downloads render in a separate hidden WebGL scene with MSAA plus 2× super-sampling up to 2048 px, then encode in the existing download worker (the worker now also accepts finished pixels).
- The screen renders on demand (only when the camera, paint or lighting changes). Leaving 3D releases the WebGL context.

## Code

| File | Role |
| --- | --- |
| `src/lib/shirt-3d-model.js` | Manifest validation and the paint projection (no three.js) |
| `src/lib/shirt-3d-pose.js` | Pose validation, presets, position ↔ pose, labels (no three.js) |
| `src/lib/shirt-3d.js` | Mesh loading, fabric material, lights, `ShirtScene`, side-panel pick, 3D downloads (lazy chunk with three.js, 164 kB gzip) |
| `src/Shirt3DView.jsx` | Viewer: OrbitControls, GSAP tweens, render loop (lazy chunk, 33 kB gzip) |
| `src/ThreeDControls.jsx` | Camera bar: angles, lock, reset, download |
| `scripts/prepare-3d-model.mjs` | Reproducible mesh preparation (`npm run model:prepare`) |

Dependencies: `three` 0.186.1, `gsap` 3.15.0; dev-only `@gltf-transform/*` 4.5.0 and `meshoptimizer` 1.2.0 for the preparation script.

## Validation (this branch)

- `npm test`: the 83 existing unit tests and 9 new ones in `tests/shirt-3d.test.js` (mesh/manifest integrity and unchanged source, attributes and UV ranges, registration against the PNG garment bounds, back paint and unchanged front paint, pose validation and framing, side-panel column choice).
- `E2E_PORT=5183 npx playwright test tests/e2e/three-d.spec.js` (2 tests; `E2E_PORT` lets a worktree run beside a dev server already on 5173): nothing 3D loads before the toggle; plain shirt renders; lock blocks dragging and angle buttons; a 512 px download is square, transparent at the corners, opaque on the shirt and named `-3d`; 3D and the locked pose survive a reload.
- `npx vite build` passes; three.js stays out of the main chunk.
- Six `tests/e2e/studio.spec.js` tests about "missing/unavailable" slots fail on this branch **and on the untouched `6cbcf60a`**; they predate this work (catalog data has since become ready). That suite also rewrites tracked screenshots under `artifacts/`.

Review renders (front, ¾, side, back ¾, back per kit; collar close-ups; a diagnostic paint grid; the Studio with a locked pose; a real 3D download) are in `artifacts/three-d/`.

## Limitations

- The mesh is an AI reconstruction from one front photo; its back, sides and folds are the generator's invention. The 3D back and sides continue the front design and are not source-reviewed kit evidence.
- Side panels simplify vertical stripes to one color; diagonal or pictorial designs show one column there.
- Sleeves keep the straight projection, so sleeve stripes curve around the sleeve's outer face.
- The outermost few units of the torso in the pure front view can show the side panel color instead of the exact 2D edge paint.
- The lateral top edges of the collar ring blend front and back paint.
- The inside of the shirt (seen through the neck) shows the projected print rather than a separate inner color.
