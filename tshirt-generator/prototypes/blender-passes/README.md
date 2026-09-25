# Blender passes prototype (not part of the app)

Tests the plan "Blender is the single source of fabric and shape; the app composites in 2D"
on one kit (Barcelona Home), next to today's flat PNG and today's three.js 3D view.

The prototype reuses the paint mapping the 3D view already has (kit paint registered to the
mesh, side panels, back collar ring), so existing kit JSON works unchanged. A clean UV unwrap,
and converting kit layouts to it, would be a later step.

```sh
node prototypes/blender-passes/make-blender-glb.mjs            # out/shirt-for-blender.glb
~/Downloads/blender-5.2.1-linux-x64/blender -b --factory-startup \
  --python prototypes/blender-passes/render_passes.py -- \
  prototypes/blender-passes/out/shirt-for-blender.glb prototypes/blender-passes/out/views \
  1536 128 0.7729 "front:0:0:1.72;quarter:35:8:1.72;side:90:4:1.72;back:180:0:1.72"
node prototypes/blender-passes/composite.mjs Barcelona home prototypes/blender-passes/out/views prototypes/blender-passes/out/compare front quarter side back
# three.js reference images: see below
node prototypes/blender-passes/compare.mjs Barcelona home prototypes/blender-passes/out/compare
```

Per view Blender renders a shading pass (neutral white fabric, studio lights, Cycles, 128
samples + denoise) and two exact data passes (kit paint UV; front/back and side-panel
weights). The compositor looks the kit up through the UV pass and multiplies it into the
shading pass exactly as the app multiplies paint into base.png.

The three.js images (`*-threejs.png`) come from the app's own 3D export
(`renderShirt3dPixels`) at the same poses and size; they were rendered from a scratch page.

Measured (1536 px, CPU only: AMD RX 580 is not supported by Cycles):
- Cycles: about 42 s per view, once. Compositing one kit: about 1 s per view.
- Web cost per view: data pass 3.1 MB (16-bit PNG) + shading 0.4 MB (lossless WebP).
