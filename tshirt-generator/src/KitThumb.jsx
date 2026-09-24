import { useContext, useEffect, useRef, useState } from "react";
import { LightingContext } from "./LightingControl.jsx";
import { loadKit } from "./lib/kit-config.js";
import { renderPngPreview } from "./lib/png-preview.js";

const SIZE = 256;
// Render a few thumbnails at a time so a long table never blocks the page.
let running = 0;
const waiting = [];
function schedule(task) {
  return new Promise((resolve, reject) => {
    const run = () => {
      running++;
      task().then(resolve, reject).finally(() => {
        running--;
        waiting.shift()?.();
      });
    };
    running < 2 ? run() : waiting.push(run);
  });
}

/**
 * Small shirt picture, rendered only once its row scrolls into view. A shirt that is
 * not ready (`item` null) shows the plain white base with a "No preview" label.
 */
export default function KitThumb({ item, label }) {
  const lighting = useContext(LightingContext);
  const ref = useRef(null),
    [state, setState] = useState("idle");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let alive = true;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      setState("loading");
      schedule(async () => {
        // Skip rows that left the table (e.g. another competition) while waiting.
        if (!alive) return;
        const config = item ? (await loadKit(item)).config : null;
        const pixels = await renderPngPreview(config, SIZE, { cache: false, lighting });
        if (!alive) return;
        el.width = el.height = SIZE;
        el.getContext("2d").putImageData(pixels, 0, 0);
        setState("ready");
      }).catch(() => alive && setState("error"));
    }, { rootMargin: "200px" });
    observer.observe(el);
    return () => {
      alive = false;
      observer.disconnect();
    };
  }, [item, lighting]);
  return (
    <span className="kit-thumb-wrap">
      <canvas ref={ref} className="kit-thumb" data-state={state} role="img" aria-label={item ? label : `${label}: no preview yet`} />
      {!item && <span className="no-preview" aria-hidden="true">No preview</span>}
    </span>
  );
}
