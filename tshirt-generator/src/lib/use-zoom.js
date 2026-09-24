import { useCallback, useRef, useState } from "react";

export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 4;
const STEP = 1.25;
const KEY_PAN = 40;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * Zoom for the preview stage: the − / + buttons zoom around the center, and
 * Ctrl/⌘ + wheel (or a trackpad pinch) zooms toward the pointer. Zoomed in, the shirt
 * can be dragged (or moved with the arrow keys). The view is a CSS transform, so
 * zooming and moving never repaint the shirt.
 */
export function useZoom() {
  const stage = useRef(null),
    drag = useRef(null),
    [view, setView] = useState({ scale: 1, x: 0, y: 0 }),
    [dragging, setDragging] = useState(false);

  // At 100% or less the shirt is always centered; zoomed in, its center stays inside the stage.
  function limit(scale, x, y) {
    const r = stage.current?.getBoundingClientRect();
    if (!r || scale <= 1) return { scale, x: 0, y: 0 };
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
  const moveBy = (dx, dy) => setView((v) => limit(v.scale, v.x + dx, v.y + dy));
  function endDrag(e) {
    if (drag.current?.id !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
  }

  // React wheel listeners are passive; a native one can stop the page scrolling.
  // A callback ref re-attaches it whenever the stage mounts (e.g. after the Catalog tab).
  // Plain scrolling keeps scrolling the page; only Ctrl/⌘ + wheel (or a trackpad pinch) zooms.
  const onWheel = useCallback((e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const r = stage.current.getBoundingClientRect();
    zoomTo((s) => s * Math.exp(-e.deltaY * 0.0015), e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2);
  }, []);
  const ref = useCallback((el) => {
    stage.current?.removeEventListener("wheel", onWheel);
    stage.current = el;
    el?.addEventListener("wheel", onWheel, { passive: false });
  }, [onWheel]);

  const pannable = view.scale > 1;
  return {
    view,
    stageProps: {
      ref,
      "data-pannable": pannable,
      "data-dragging": dragging,
      // Focusable only while there is something to move, so arrow keys can pan.
      tabIndex: pannable ? 0 : undefined,
      "aria-label": pannable ? "Zoomed shirt: drag or use the arrow keys to move it" : undefined,
      onPointerDown(e) {
        if (!pannable || e.button !== 0) return;
        drag.current = { id: e.pointerId, x: e.clientX - view.x, y: e.clientY - view.y };
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
      },
      onPointerMove(e) {
        const d = drag.current;
        if (d?.id === e.pointerId) setView((v) => limit(v.scale, e.clientX - d.x, e.clientY - d.y));
      },
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onKeyDown(e) {
        const step = { ArrowLeft: [KEY_PAN, 0], ArrowRight: [-KEY_PAN, 0], ArrowUp: [0, KEY_PAN], ArrowDown: [0, -KEY_PAN] }[e.key];
        if (!pannable || !step) return;
        e.preventDefault();
        moveBy(...step);
      },
    },
    zoomIn: () => zoomTo((s) => s * STEP),
    zoomOut: () => zoomTo((s) => s / STEP),
    center: () => setView({ scale: 1, x: 0, y: 0 }),
  };
}
