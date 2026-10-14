# Smooth T-shirt studio

## Latest: armhole stitching ends at the underarm fold (r007)

Open `tshirt-base-stitched-r007.blend`. The sleeve and body cloth only join at the bottom of a narrow underarm fold (about z 0.535 m), so r006's closed armhole loop showed as a tail running down between the hanging sleeve and the body. r007 keeps r006's armhole arc over the shoulder but ends the visible stitching where that fold opens (z 0.575 m) at the front and back; the hidden fold is unstitched. `tshirt-underarm-rear.png` and `tshirt-underarm-rear-detail.png` are the inspection renders and `underarm-stitch-report.json` records the heights. `scripts/blender-raise-underarm.py` reproduces this from r006, or updates the live scene after making a timestamped backup.

## Corrected rear armhole joins (r006)

Open `tshirt-base-stitched-r006.blend`. Rear armhole seams meet the underarm fold higher, removing the hooked tails below it. The front-to-back connection follows a shortest path on the garment mesh before smoothing and surface fitting, instead of projecting a straight bridge through adjacent folds. The full collar loop and cuff seams are retained. `tshirt-rear-stitches.png` and `tshirt-rear-stitches-angle.png` show the rear and rear three-quarter inspection views. `scripts/blender-fix-rear-arms.py` reproduces this from r005, or updates the live scene after making a timestamped backup. Its inspection renders hide the obstructing cyclorama and use a temporary rear softbox.

## Complete collar stitching (r005)

Open `tshirt-base-stitched-r005.blend`. Collar sewing is a closed 360-degree double row, with coverstitch loops and a cyclic joining seam around the front, sides and rear of the existing neckline. The previous front path is retained and connected through a surface-fitted rear arc; partial collar/facing paths are replaced so no loose ends remain. The saved top view exposes the complete loop. `tshirt-complete-collar-top.png` and `tshirt-complete-collar-front.png` are its inspection renders. Reproduce from r004 with `scripts/blender-close-collar.py`; running it in the open r004 scene saves a timestamped backup first. Sleeve seams and garment mesh are unchanged.

## Corrected lateral sleeve stitching (r004)

Open `tshirt-base-stitched-r004.blend`. Both armholes have straighter front/back panel paths and smooth surface-fitted shoulder joins; the previous outward bridge bulges are removed. Cuff joins are smoothed along their existing hem route. The round collar, shirt mesh and smooth fabric are retained. The saved three-quarter view exposes the shoulder seam for inspection. `tshirt-corrected-seams-angle.png` and `tshirt-corrected-seams-detail.png` show this revision. Reproduce with `scripts/blender-fix-sleeve-seams.py` in background Blender. Running that script in the existing Blender scene preserves current edits in a timestamped `before-sleeve-fix-*.blend` copy before saving r004.

## Visible stitching in Blender (r003)

Open `tshirt-base-stitched-r003.blend`. It starts with an enlarged front view of the collar and both sleeves. Cotton topstitch diameter is 0.68 mm, with finer 0.36 mm cross-loops, raised slightly off the surface and given more contrast to remain readable in Material Preview. All construction objects are visible. `scripts/blender-visible-stitches.py` updates an open r002 scene and saves r003 separately; `scripts/blender-render-visible-stitches.py` renders `tshirt-visible-stitches-detail.png`. The earlier revisions and their renders remain unchanged.

## Base-referenced stitching (r002)

Open `tshirt-base-stitched-r002.blend` for the updated model based on `model.glb` and the construction visible in `base.png`. The width-to-height ratio matches the base. The original model's volume and folds are retained with gentle smoothing. The **CONSTRUCTION** collection holds editable thread and seam curves for the round collar, visible neck facing, armholes, cuffs and hem, with double rows and coverstitch cross-loops at the collar and armholes. The cloth material has no coarse noise or bump texture. Back construction is an inferred continuation of the front reference.

`tshirt-base-stitched-front.png`, `tshirt-base-stitched-angle.png` and `tshirt-base-stitched-transparent.png` are the 2400 × 2800 outputs. `tshirt-base-collar-detail.png` is a 1500 × 900 close-up of the sewing. Build with `scripts/blender-stitch-shirt.py` and render with `scripts/blender-render-stitched.py`, using the Blender command pattern below. The first smooth study remains available separately.

## Initial smooth study

Open `tshirt-smooth-studio.blend` in Blender. The shirt is selected and framed by the front camera.

- `tshirt-studio-front.png`: 1800 × 2000 front product render.
- `tshirt-studio-angle.png`: 1800 × 2000 three-quarter product render.
- `tshirt-transparent.png`: 1800 × 2000 front render with transparent background.

## Editing

Select **T-Shirt | smooth editable fabric**. The modifier **Gentle surface smoothing | preserve silhouette** controls geometric smoothing; its vertex group reduces smoothing around the collar and hems. The material **FABRIC | clean pearl white matte cotton** controls color and roughness. It contains no image texture, bump, normal map, or displacement.

The hidden **SOURCE** collection contains the original imported mesh and original material for comparison. Keep it hidden during rendering. The source `model.glb` in the project root is unchanged.

The **STUDIO** collection contains three cameras, four named area softboxes and a curved matte background. F12 renders the active front camera with Cycles at 1800 × 2000. For transparent output, hide **STAGE** in renders and enable **Render Properties → Film → Transparent**.

## Reproduction

From the repository directory in PowerShell:

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python scripts/blender-prepare-shirt.py
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --factory-startup --python scripts/blender-render-shirt.py
```

These commands rebuild the studio artifact and its renders. Save manual edits under a different filename before rerunning. The supplied model's overall shape and folds are retained; smoothing is not garment retopology. The web application's original PNG and kit configurations are unchanged.
