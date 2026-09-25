import { useEffect, useRef } from "react";
import Icon from "./Icon.jsx";

/**
 * Shirt views. Only the front has a base PNG and paint geometry today; the others
 * switch on once their own base image and silhouette mapping exist.
 */
export const SHIRT_VIEWS = [
  { id: "front", label: "Front", available: true },
  { id: "side", label: "Side", available: false },
  { id: "three-quarter", label: "¾", available: false },
];

/** Live mini copy of the main preview canvas, refreshed whenever it finishes rendering. */
function LiveThumb() {
  const ref = useRef(null);
  useEffect(() => {
    const thumb = ref.current, source = thumb?.closest(".canvas")?.querySelector(".shirt-image");
    if (!source) return;
    const copy = () => {
      if (source.dataset.renderState !== "ready" || !source.width) return;
      thumb.width = thumb.height = 128;
      const ctx = thumb.getContext("2d");
      ctx.clearRect(0, 0, 128, 128);
      ctx.drawImage(source, 0, 0, 128, 128);
    };
    copy();
    const observer = new MutationObserver(copy);
    observer.observe(source, { attributes: true, attributeFilter: ["data-render-state", "width"] });
    return () => observer.disconnect();
  }, []);
  return <canvas ref={ref} className="view-thumb" aria-hidden="true" />;
}

/** Vertical bar of view thumbnails on the left of the canvas. */
export default function ShirtViews({ view, onSelect }) {
  return (
    <div className="shirt-views" role="group" aria-label="Shirt view">
      {SHIRT_VIEWS.map((v) => (
        <button
          key={v.id}
          className={`view-option ${view === v.id ? "active" : ""}`}
          aria-pressed={view === v.id}
          disabled={!v.available}
          title={v.available ? `${v.label} view` : `${v.label} view · coming soon (needs its own base image)`}
          onClick={() => onSelect(v.id)}
        >
          {v.available ? <LiveThumb /> : <Icon name="shirt" size={22} />}
          <span>{v.label}</span>
          {!v.available && <small>Soon</small>}
        </button>
      ))}
    </div>
  );
}
