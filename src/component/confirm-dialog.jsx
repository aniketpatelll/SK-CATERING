import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./confirm-dialog.css";

// The pop-up box itself.
export function ConfirmBox({
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  danger = true,
  onConfirm,
  onCancel,
  cancelRef,
}) {
  return (
    <div
      className="confirm-box"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-msg"
      onClick={(e) => e.stopPropagation()}
    >
      <div className={`confirm-icon ${danger ? "danger" : ""}`} aria-hidden="true">
        {danger ? "🗑️" : "❓"}
      </div>
      <h3 id="confirm-title">{title}</h3>
      <p id="confirm-msg">{message}</p>
      <div className="confirm-actions">
        <button ref={cancelRef} className="c-cancel" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button className={`c-ok ${danger ? "danger" : ""}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

// Use instead of window.confirm. Click outside or press Esc to cancel.
function ConfirmDialog(props) {
  const cancelRef = useRef(null);
  const onCancelRef = useRef(props.onCancel);
  onCancelRef.current = props.onCancel;

  useEffect(() => {
    cancelRef.current?.focus(); // Cancel is focused first, so Enter never deletes by accident
    const onKey = (e) => e.key === "Escape" && onCancelRef.current();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return createPortal(
    <div className="confirm-overlay" onClick={props.onCancel}>
      <ConfirmBox {...props} cancelRef={cancelRef} />
    </div>,
    document.body
  );
}

export default ConfirmDialog;
