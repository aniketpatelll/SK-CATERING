import { useState } from "react";
import "./qty-control.css";

const MAX_QTY = 9999;

// − [ number you can type ] +   Used in the bill on every page.
function QtyControl({ qty, name, onStep, onSet }) {
  const [draft, setDraft] = useState(null); // text while typing; null = show the real quantity

  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    setDraft(digits);
    const n = Number(digits);
    if (digits !== "" && n >= 1) onSet(Math.min(n, MAX_QTY)); // bill updates while you type
  };

  return (
    <div className="qty">
      <button
        onClick={() => {
          setDraft(null);
          onStep(-1);
        }}
        aria-label={`Remove one ${name}`}
      >
        −
      </button>
      <input
        className="qty-input"
        inputMode="numeric"
        value={draft ?? qty}
        onChange={handleChange}
        onFocus={(e) => e.target.select()}
        onBlur={() => setDraft(null)} // empty or 0 goes back to the last valid quantity
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        aria-label={`Quantity of ${name}`}
      />
      <button
        onClick={() => {
          setDraft(null);
          onStep(1);
        }}
        aria-label={`Add one ${name}`}
      >
        +
      </button>
    </div>
  );
}

export default QtyControl;
