import { useEffect, useRef } from "react";

/**
 * Blocking yes/no question (native modal <dialog>: focus stays inside, the page
 * behind is inert, Escape answers No). Rendered only while a question is open.
 * @param {{title:string, message:string, note?:string, confirmLabel?:string, onConfirm:()=>void, onCancel:()=>void}} props
 */
export default function ConfirmDialog({ title, message, note, confirmLabel = "Yes", onConfirm, onCancel }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      <h2 id="confirm-title">{title}</h2>
      <p id="confirm-message">{message}</p>
      {note && <p className="confirm-note">{note}</p>}
      <div className="confirm-actions">
        <button className="secondary" onClick={onCancel}>
          No
        </button>
        <button className="primary" onClick={onConfirm} autoFocus>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
