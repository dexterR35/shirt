import { createContext, useId } from "react";
import { LIGHTING_DEFAULT, LIGHTING_MIN, LIGHTING_MAX } from "./lib/composite.js";
import Icon from "./Icon.jsx";

/** Shared by Studio and catalog pictures; exports use the same app-owned value. */
export const LightingContext = createContext(LIGHTING_DEFAULT);

export default function LightingControl({ value, onChange, disabled = false }) {
  const id = useId();
  return (
    <div className="lighting-control" role="group" aria-label="Shirt lighting">
      <label htmlFor={id}>Lighting <strong>{value > 0 ? `+${value}` : value}</strong></label>
      <input id={id} type="range" min={LIGHTING_MIN} max={LIGHTING_MAX} step="1"
        aria-label="Lighting" aria-valuetext={`${value}${value === LIGHTING_DEFAULT ? " (original)" : ""}`}
        value={value} disabled={disabled} onChange={(e) => onChange(Number(e.target.value))} />
      <button className="primary reset-lighting" aria-label="Reset lighting" title="Reset lighting"
        disabled={disabled || value === LIGHTING_DEFAULT}
        onClick={() => onChange(LIGHTING_DEFAULT)}><Icon name="reset" size={14} /></button>
    </div>
  );
}
