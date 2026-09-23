import { useEffect, useRef, useState } from "react";

const EDGE = 8;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi));

/**
 * Reusable floating dialog. It is non-blocking: the page behind it stays usable,
 * so the editor can still receive clicks on the shirt. Drag it by its title bar;
 * it always stays inside the window. Escape closes it.
 * @param {{title:string, onClose:()=>void, footer?:any, children:any, className?:string}} props
 */
export default function Modal({ title, onClose, footer, children, className = "" }) {
  const ref = useRef(null),
    drag = useRef(null),
    [pos, setPos] = useState(null);

  function within(x, y) {
    const r = ref.current.getBoundingClientRect();
    return { x: clamp(x, EDGE, innerWidth - r.width - EDGE), y: clamp(y, EDGE, innerHeight - r.height - EDGE) };
  }

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    // Keep a moved dialog on screen when the window shrinks.
    const onResize = () => setPos((p) => p && within(p.x, p.y));
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [onClose]);

  const handle = {
    onPointerDown(e) {
      if (e.button !== 0 || e.target.closest("button")) return;
      const r = ref.current.getBoundingClientRect();
      drag.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove(e) {
      if (drag.current) setPos(within(e.clientX - drag.current.dx, e.clientY - drag.current.dy));
    },
    onPointerUp() {
      drag.current = null;
    },
  };

  return (
    <section
      ref={ref}
      className={`modal ${className}`}
      role="dialog"
      aria-modal="false"
      aria-label={title}
      style={pos ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto" } : undefined}
    >
      <header className="modal-head" {...handle}>
        <h2>{title}</h2>
        <button className="modal-close" aria-label="Close" onClick={onClose}>
          ✕
        </button>
      </header>
      <div className="modal-body">{children}</div>
      {footer && <footer className="modal-foot">{footer}</footer>}
    </section>
  );
}
