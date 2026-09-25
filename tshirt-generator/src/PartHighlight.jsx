import { useEffect, useRef } from "react";
import { drawPartHighlight } from "./lib/png-preview.js";

/** Transparent overlay above the shirt that outlines the selected and hovered parts. */
export default function PartHighlight({ config, selected, hover, view = 'front', facing = 'right' }) {
  const ref = useRef(null), sequence = useRef(0);
  useEffect(() => {
    const overlay = ref.current, shirt = overlay?.parentElement.querySelector(".shirt-image");
    if (!shirt?.width) return;
    const run = ++sequence.current;
    // Draw into a scratch canvas first so a slower earlier call never overwrites a newer one.
    const scratch = document.createElement("canvas");
    drawPartHighlight(scratch, shirt, config, selected, hover, view, facing)
      .then(() => {
        if (run !== sequence.current) return;
        overlay.width = scratch.width;
        overlay.height = scratch.height;
        overlay.getContext("2d").drawImage(scratch, 0, 0);
      })
      .catch(() => {});
  }, [config, selected, hover, view, facing]);
  return <canvas ref={ref} className="part-highlight" aria-hidden="true" />;
}
