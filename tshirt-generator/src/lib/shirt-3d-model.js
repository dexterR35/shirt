/**
 * The 3D shirt mesh and how kit paint lands on it. Pure data and maths (no three.js),
 * shared by `npm run model:prepare`, the 3D view and tests.
 *
 * The mesh is `data/model.glb` (image-to-3D from the same base.png), prepared into
 * `public/assets/3d`: front faces +Z, up is +Y, units are meters. Kit paint keeps its
 * 200-unit grid: an affine fit of the mesh's front silhouette to the PNG's alpha maps
 * model (x, y) onto paint (u, v) and projects straight through front to back.
 */

export const MODEL_3D_VERSION = 'tripo-shirt-3d-1';
export const MODEL_3D_MANIFEST = '/assets/3d/manifest.json';

const finite = (n, label) => {
  if (typeof n !== 'number' || !Number.isFinite(n)) throw Error(`Invalid 3D model ${label}`);
  return n;
};

/**
 * Model (x, y) in meters -> paint (u, v) in the 200-unit grid.
 * @param {number} x
 * @param {number} y
 * @param {{x0:number,y0:number,xScale:number,yScale:number}} paint
 * @returns {[number, number]}
 */
export function paintPoint(x, y, paint) {
  return [(x - paint.x0) * paint.xScale, (paint.y0 - y) * paint.yScale];
}

/** Paint (u, v) -> texture coordinates of a canvas texture (flipY: v = 1 at the top row). */
export function paintUv(x, y, paint) {
  const [u, v] = paintPoint(x, y, paint);
  return [u / 200, 1 - v / 200];
}

/**
 * Validate the manifest written by `npm run model:prepare` before anything is fetched.
 * @param {any} manifest
 */
export function validateModelManifest(manifest) {
  if (manifest?.version !== MODEL_3D_VERSION || !/^\/assets\/3d\/shirt-[\da-f]{12}\.glb$/.test(manifest.path) ||
      !/^[\da-f]{64}$/.test(manifest.sha256) || !/^[\da-f]{64}$/.test(manifest.source?.sha256 ?? ''))
    throw Error('The 3D shirt model manifest is missing or unsupported. Run npm run model:prepare.');
  const {paint, bounds, detail} = manifest;
  for (const key of ['x0', 'y0', 'xScale', 'yScale']) finite(paint?.[key], `paint ${key}`);
  if (paint.xScale <= 0 || paint.yScale <= 0 || !(paint.iou > 0.95 && paint.iou <= 1))
    throw Error('The 3D shirt paint registration is not trustworthy.');
  for (const corner of [bounds?.min, bounds?.max])
    if (!Array.isArray(corner) || corner.length !== 3) throw Error('Invalid 3D model bounds');
    else corner.forEach((v) => finite(v, 'bounds'));
  finite(detail?.mean, 'detail mean');
  if (detail.mean <= 0 || detail.mean > 1) throw Error('Invalid 3D fabric detail level');
  return manifest;
}
