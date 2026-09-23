import { useEffect, useRef, useState } from "react";
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

/** Small shirt picture for a ready kit, rendered only once its row scrolls into view. */
export default function KitThumb({ item, label }) {
  const ref = useRef(null),
    [state, setState] = useState("idle");
  useEffect(() => {
    const el = ref.current;
    if (!el || !item) return;
    let alive = true;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      setState("loading");
      schedule(async () => {
        const { config } = await loadKit(item);
        const pixels = await renderPngPreview(config, SIZE, { cache: false });
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
  }, [item]);
  if (!item) return <span className="kit-thumb empty" aria-hidden="true" />;
  return <canvas ref={ref} className="kit-thumb" data-state={state} role="img" aria-label={label} />;
}
