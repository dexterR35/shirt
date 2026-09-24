import { createContext, useId } from "react";
import { LIGHTING_DEFAULT, LIGHTING_MIN, LIGHTING_MAX } from "./lib/composite.js";

/** Shared by Studio and catalog pictures; exports use the same app-owned value. */
export const LightingContext = createContext(LIGHTING_DEFAULT);

export default function LightingControl({ value, onChange, disabled = false }) {
  const id = useId();
  return (
    <div className="lighting-control" role="group" aria-label="Shirt lighting">
      <div className="lighting-heading">
        <label htmlFor={id}>Lighting <strong>{value}%</strong></label>
        <button className="secondary" disabled={disabled || value === LIGHTING_DEFAULT}
          onClick={() => onChange(LIGHTING_DEFAULT)}>Reset lighting</button>
      </div>
      <input id={id} type="range" min={LIGHTING_MIN} max={LIGHTING_MAX} step="5"
        aria-label="Lighting" aria-describedby={`${id}-hint`} aria-valuetext={`${value}%${value === LIGHTING_DEFAULT ? " (original)" : ""}`}
        value={value} disabled={disabled} onChange={(e) => onChange(Number(e.target.value))} />
      <small id={`${id}-hint`}>Applies to previews and all downloads · 100% is original</small>
    </div>
  );
}
