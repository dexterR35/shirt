import { useCallback, useRef, useState } from "react";

export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 4;
const STEP = 1.25;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * Zoom (buttons, wheel, pinch) and drag-to-pan for the preview stage.
 * The view is a CSS transform, so zooming never repaints the shirt.
 */
export function useZoom() {
  const stage = useRef(null),
    pointers = useRef(new Map()),
    [view, setView] = useState({ scale: 1, x: 0, y: 0 }),
    [dragging, setDragging] = useState(false);

  // Keep the shirt's center inside the stage at every zoom level.
  function limit(scale, x, y) {
    const r = stage.current?.getBoundingClientRect();
    if (!r) return { scale, x: 0, y: 0 };
    const mx = (r.width * scale) / 2,
      my = (r.height * scale) / 2;
    return { scale, x: clamp(x, -mx, mx), y: clamp(y, -my, my) };
  }
  /** Zoom around a point given relative to the stage center. */
  function zoomTo(next, px = 0, py = 0) {
    setView((v) => {
      const scale = clamp(next(v.scale), ZOOM_MIN, ZOOM_MAX),
        k = scale / v.scale;
      return limit(scale, px - (px - v.x) * k, py - (py - v.y) * k);
    });
  }
  function fromCenter(clientX, clientY) {
    const r = stage.current.getBoundingClientRect();
    return [clientX - r.left - r.width / 2, clientY - r.top - r.height / 2];
  }

  // React wheel listeners are passive; a native one can stop the page scrolling.
  // A callback ref re-attaches it whenever the stage mounts (e.g. after the Catalog tab).
  // Plain scrolling keeps scrolling the page; only Ctrl/⌘ + wheel (or a trackpad pinch) zooms.
  const onWheel = useCallback((e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const [px, py] = fromCenter(e.clientX, e.clientY);
    zoomTo((s) => s * Math.exp(-e.deltaY * 0.0015), px, py);
  }, []);
  const ref = useCallback((el) => {
    stage.current?.removeEventListener("wheel", onWheel);
    stage.current = el;
    el?.addEventListener("wheel", onWheel, { passive: false });
  }, [onWheel]);

  const stageProps = {
    ref,
    onPointerDown(e) {
      if (e.button !== 0 || e.target.closest("button")) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      setDragging(true);
    },
    onPointerMove(e) {
      const map = pointers.current,
        prev = map.get(e.pointerId);
      if (!prev) return;
      if (map.size === 1) {
        setView((v) => limit(v.scale, v.x + e.clientX - prev.x, v.y + e.clientY - prev.y));
      } else if (map.size === 2) {
        const other = [...map].find(([id]) => id !== e.pointerId)[1],
          before = Math.hypot(prev.x - other.x, prev.y - other.y),
          after = Math.hypot(e.clientX - other.x, e.clientY - other.y),
          [px, py] = fromCenter((e.clientX + other.x) / 2, (e.clientY + other.y) / 2);
        if (before > 0) zoomTo((s) => (s * after) / before, px, py);
      }
      map.set(e.pointerId, { x: e.clientX, y: e.clientY });
    },
    onPointerUp(e) {
      pointers.current.delete(e.pointerId);
      if (!pointers.current.size) setDragging(false);
    },
    onPointerCancel(e) {
      pointers.current.delete(e.pointerId);
      if (!pointers.current.size) setDragging(false);
    },
    onDoubleClick: () => setView({ scale: 1, x: 0, y: 0 }),
  };

  return {
    view,
    dragging,
    stageProps,
    zoomIn: () => zoomTo((s) => s * STEP),
    zoomOut: () => zoomTo((s) => s / STEP),
    center: () => setView({ scale: 1, x: 0, y: 0 }),
  };
}
