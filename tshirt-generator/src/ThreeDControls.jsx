import Icon from "./Icon.jsx";
import { DEFAULT_POSE, POSE_PRESETS, presetPose, samePose } from "./lib/shirt-3d-pose.js";

/**
 * The 3D view's bar on the left of the canvas: camera angles, pose lock and reset.
 * Collection downloads also use this pose while the 3D view is on.
 */
export default function ThreeDControls({ pose, onPose, locked, onLock, disabled = false }) {
  return (
    <div className="three-d-controls" role="toolbar" aria-label="3D camera">
      {POSE_PRESETS.map((p) => (
        <button key={p.id} className="three-d-option" disabled={locked || disabled}
          aria-pressed={pose.azimuth === p.azimuth && pose.elevation === p.elevation}
          onClick={() => onPose(presetPose(p.id, pose))}>
          {p.label}
        </button>
      ))}
      <button className={`three-d-option three-d-lock ${locked ? "active" : ""}`} aria-pressed={locked} disabled={disabled}
        title={locked ? "Unlock the camera" : "Lock the camera: downloads use exactly this angle"}
        onClick={() => onLock(!locked)}>
        <Icon name={locked ? "lock" : "unlock"} size={14} />
        {locked ? "Locked" : "Lock"}
      </button>
      <button className="three-d-option" aria-label="Reset camera" title="Reset camera"
        disabled={locked || disabled || samePose(pose, DEFAULT_POSE)} onClick={() => onPose(DEFAULT_POSE)}>
        <Icon name="reset" size={14} />
      </button>

    </div>
  );
}
