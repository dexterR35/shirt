# Three-quarter image from original base

Tool: built-in imagegen.
Source: `../../../starter/shirt-svg/base.png` (8000 × 5000; unchanged).
Source SHA-256: `4670b8b8dd8d66d22a4b5313aac9e5406d9c0913244a72bdcebe41e347637042`.
Output: `shirt-three-quarter.png`, 1086 × 1448, RGB PNG with an opaque light-grey background.
Status: visual candidate only; not integrated as the application fabric base. The generated camera viewpoint infers unseen surfaces from the source photo. This is not an 8K source-equivalent master. A transparent production cutout and separate color mapping are still needed for app integration.
Orientation: near sleeve on image left, front facing image right, suitable for the left/Home position in a VS pairing.

## Generation prompt

Use case: identity-preserve, product-mockup.
Edit target and ONLY reference: the user's original plain white shirt in base.png.
Create ONE new photograph of THIS SAME GARMENT seen from a real three-quarter camera viewpoint. Move the camera about 30–35 degrees around the stationary shirt so its front faces toward image RIGHT, its image-left shoulder/sleeve is closer, and the far sleeve is naturally foreshortened. This is a new physical camera viewpoint, NOT a trapezoidal perspective transform, skew, bend, stretch or warp of the flat reference image.
Preserve the garment identity very strictly: original slim regular straight football-shirt fit, same torso length and width, short set-in sleeves, the same thin round crew neck with its existing two fine seam lines, the same fine lightweight white fabric and restrained soft fold style. Plain thin sleeve hems and plain thin bottom hem exactly like the source. NO thick cuff bands, NO thick bottom band, NO raglan panels, no invented piping, no extra side panels, no tags, logo, lettering, graphics or colors.
Keep the shirt standing upright; vertical center axis straight, hem naturally level in the scene, no leaning or bent torso. Let true three-dimensional camera perspective reveal the near side and round sleeve opening naturally. Ghost-mannequin product photography with no mannequin/body/hanger visible. Both sleeves and complete bottom hem visible, centered, small even margin.
Lighting: source-matching neutral soft diffuse studio light, white to light-grey shading with crisp subtle weave and seam detail, no deep theatrical folds or dark cast shadows.
Background: fully transparent PNG with real alpha outside the shirt. Do not render a checkerboard or any backdrop.
Output: maximum native resolution supported, ideally 2160×3840 portrait or higher-quality native equivalent. Prioritize high-frequency fabric detail and clean edges suitable for a reusable shirt base. Do NOT substitute a low-detail stylized render or change the shirt's construction. Only one neutral shirt, no VS text or second garment.

## Background extraction attempt

Use case: background-extraction. Edit target: the attached single plain white three-quarter shirt. Remove the grey checkerboard background completely and return a PNG with REAL TRANSPARENT ALPHA. The checkerboard in the input is unwanted opaque pixels, not transparency. Preserve the shirt itself exactly, its position, silhouette, neutral white/grey fabric, stitches, folds, round collar, sleeve openings, and current portrait framing. Do not change the shirt, its camera angle, proportions, or texture. No new objects. No painted checkerboard, no grey or white backdrop. ONLY the isolated shirt on actual alpha transparency. Keep full native resolution and fine fabric detail.

Result: output had no alpha channel and still contained the checkerboard. Not selected.

## Final background cleanup prompt

Use case: precise-object-edit. Input image is the edit target. Replace ONLY the checkerboard background and all pale background artefacts with a perfectly clean uniform light-grey studio background, RGB 235,237,240. Keep every part of this white shirt unchanged: its three-quarter camera angle, upright torso, collar, sleeves, proportions, fabric texture, seams and folds. Keep full shirt visible and same framing. No checkerboard, no pattern, no text, no new objects. High-detail photorealistic product image. Output highest available native resolution.

## Selected tool output

`/home/dexter/.codex/generated_images/01a0d79d-4f96-7421-96ae-0f25a57ccc67/exec-ee946115-d7eb-43ec-8b5f-a04329be23a2.png`

