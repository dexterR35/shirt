import { useContext, useEffect, useRef } from "react";
import Icon from "./Icon.jsx";
import { LightingContext } from './LightingControl.jsx';
import { renderPngPreview } from './lib/png-preview.js';

/**
 * Front and Angled share the same photograph and completed paint composite.
 */
export const SHIRT_VIEWS = [
  { id: "front", label: "Front", available: true },
  { id: "side", label: "Side", available: false },
  { id: "three-quarter", label: "Angled", available: true },
];

/** Each thumbnail shows its own angle, independent of the main preview. */
function LiveThumb({ config, view, facing }) {
  const ref = useRef(null);
  const lighting = useContext(LightingContext);
  useEffect(() => {
    let alive = true;
    const thumb = ref.current;
    thumb.width = thumb.height = 128;
    const timer = setTimeout(() => renderPngPreview(config, 128, {view, lighting, facing}).then(pixels => {
      if (alive) thumb.getContext('2d').putImageData(pixels, 0, 0);
    }).catch(() => { /* The main preview provides an actionable retry message. */ }), 125);
    return () => { alive = false; clearTimeout(timer); };
  }, [config, view, lighting, facing]);
  return <canvas ref={ref} className="view-thumb" data-view={view} aria-hidden="true" />;
}

/** Vertical bar of view thumbnails on the left of the canvas. */
export default function ShirtViews({ view, onSelect, config, facing = 'right', disabled = false }) {
  return (
    <div className="shirt-views" role="group" aria-label="Shirt view">
      {SHIRT_VIEWS.map((v) => (
        <button
          key={v.id}
          className={`view-option ${view === v.id ? "active" : ""}`}
          aria-pressed={view === v.id}
          disabled={!v.available || disabled}
          title={!v.available ? `${v.label} view · coming soon (needs its own base image)` : v.id === 'three-quarter' ? `Original PNG in perspective · faces ${facing}` : 'Front view'}
          onClick={() => onSelect(v.id)}
        >
          {v.available ? <LiveThumb config={config} view={v.id} facing={facing} /> : <Icon name="shirt" size={22} />}
          <span>{v.label}</span>
          {!v.available && <small>Soon</small>}
        </button>
      ))}
    </div>
  );
}
