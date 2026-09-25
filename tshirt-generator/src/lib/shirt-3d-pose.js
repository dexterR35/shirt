/**
 * Camera poses for the 3D view. A pose orbits the shirt's center, so the shirt stays
 * centered like the 2D preview, and it is independent of the canvas size: the same
 * pose gives the same framing on screen and in every download. No three.js here.
 *
 * azimuth: degrees around the vertical axis; 0 faces the front, 90 shows the shirt's
 *          left side (the viewer's right), 180 the back.
 * elevation: degrees above (+) or below (-) the chest.
 * distance: meters from the shirt's center (the shirt is 0.75 m tall).
 */

export const POSE_VERSION = 1;
/** Vertical field of view in degrees: a long lens, like a product photograph. */
export const CAMERA_FOV = 28;
export const POSE_LIMITS = Object.freeze({ elevation: [-60, 75], distance: [0.9, 3.4] });

/** @typedef {{version:number, azimuth:number, elevation:number, distance:number}} ShirtPose */

/** @type {ShirtPose} Framed like the 2D preview: the shirt fills about 7/8 of the height. */
export const DEFAULT_POSE = Object.freeze({ version: POSE_VERSION, azimuth: 0, elevation: 0, distance: 1.72 });

export const POSE_PRESETS = Object.freeze([
  Object.freeze({ id: 'front', label: 'Front', azimuth: 0, elevation: 0 }),
  Object.freeze({ id: 'three-quarter-right', label: '¾ right', azimuth: 35, elevation: 8 }),
  Object.freeze({ id: 'side', label: 'Side', azimuth: 90, elevation: 4 }),
  Object.freeze({ id: 'back', label: 'Back', azimuth: 180, elevation: 0 }),
  Object.freeze({ id: 'three-quarter-left', label: '¾ left', azimuth: -35, elevation: 8 }),
]);

const clamp = (v, [lo, hi]) => Math.min(hi, Math.max(lo, v));
/** Azimuth in (-180, 180]. */
export const wrapAzimuth = (a) => {
  const w = ((a % 360) + 360) % 360;
  return w > 180 ? w - 360 : w;
};
const round = (v) => Math.round(v * 100) / 100;

/**
 * Accept a stored or edited pose; anything malformed throws.
 * @param {any} pose
 * @returns {ShirtPose}
 */
export function validatePose(pose) {
  if (!pose || typeof pose !== 'object' || pose.version !== POSE_VERSION ||
      !['azimuth', 'elevation', 'distance'].every((k) => typeof pose[k] === 'number' && Number.isFinite(pose[k])))
    throw Error('Invalid 3D camera pose.');
  return {
    version: POSE_VERSION,
    azimuth: round(wrapAzimuth(pose.azimuth)),
    elevation: round(clamp(pose.elevation, POSE_LIMITS.elevation)),
    distance: round(clamp(pose.distance, POSE_LIMITS.distance)),
  };
}

/** Camera position (meters) for a pose, looking at the shirt's center. */
export function poseToPosition(pose) {
  const { azimuth, elevation, distance } = validatePose(pose);
  const a = (azimuth * Math.PI) / 180, e = (elevation * Math.PI) / 180;
  return [distance * Math.cos(e) * Math.sin(a), distance * Math.sin(e), distance * Math.cos(e) * Math.cos(a)];
}

/** The pose of a camera at `position`, looking at the shirt's center. */
export function positionToPose([x, y, z]) {
  const distance = Math.hypot(x, y, z);
  if (!(distance > 0)) throw Error('Invalid 3D camera position.');
  return validatePose({
    version: POSE_VERSION,
    azimuth: (Math.atan2(x, z) * 180) / Math.PI,
    elevation: (Math.asin(y / distance) * 180) / Math.PI,
    distance,
  });
}

/** A preset at the pose's current distance (switching angle never zooms). */
export function presetPose(id, current = DEFAULT_POSE) {
  const preset = POSE_PRESETS.find((p) => p.id === id);
  if (!preset) throw Error('Unknown 3D view.');
  return validatePose({ ...validatePose(current), azimuth: preset.azimuth, elevation: preset.elevation });
}

/** The azimuth to tween to, going the short way round. */
export const nearestAzimuth = (from, to) => from + wrapAzimuth(to - from);

export const samePose = (a, b) => a.azimuth === b.azimuth && a.elevation === b.elevation && a.distance === b.distance;

/** "35° right · 8° up · 1.72 m", for dialogs and labels. */
export function describePose(pose) {
  const { azimuth, elevation, distance } = validatePose(pose);
  const turn = azimuth === 0 ? 'front' : Math.abs(azimuth) === 180 ? 'back' : `${Math.abs(Math.round(azimuth))}° ${azimuth > 0 ? 'right' : 'left'}`;
  const tilt = Math.round(elevation) === 0 ? 'level' : `${Math.abs(Math.round(elevation))}° ${elevation > 0 ? 'up' : 'down'}`;
  return `${turn} · ${tilt} · ${distance.toFixed(2)} m`;
}

/** A 3D download's file name: the flat download's name with "-3d" before the extension. */
export const threeDFilename = (name) => name.replace(/(\.\w+)$/, '-3d$1');
