import { useEffect } from "react";
import { createPortal } from "react-dom";
import "./receipt.css";

const money = (n) => `₹${Number(n).toFixed(2)}`;

// The bill itself (what gets printed).
export function ReceiptSheet({ order }) {
  const railway = order.source === "Railway";
  const date = new Date(order.createdAt || Date.now()).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="receipt-sheet">
      <h2 className="r-title">SK CATERING</h2>
      <p className="r-sub">Bill</p>

      <div className="r-meta">
        {order.number && <div><span>Bill no</span><strong>#{order.number}</strong></div>}
        <div><span>Date</span><strong>{date}</strong></div>
        {railway ? (
          <>
            <div><span>Train</span><strong>{order.train?.id} {order.train?.name}</strong></div>
            <div><span>Route</span><strong>{order.train?.from} → {order.train?.to}</strong></div>
            {order.station && <div><span>Station</span><strong>{order.station}</strong></div>}
            {order.date && <div><span>Journey</span><strong>{order.date}</strong></div>}
            {order.passengers ? <div><span>Passengers</span><strong>{order.passengers}</strong></div> : null}
            {order.vendor && <div><span>Vendor</span><strong>{order.vendor}</strong></div>}
            {order.seat && <div><span>Coach / seat</span><strong>{order.seat}</strong></div>}
          </>
        ) : (
          <div><span>Customer</span><strong>{order.customer || "Guest"}</strong></div>
        )}
      </div>

      <table className="r-items">
        <thead>
          <tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
        </thead>
        <tbody>
          {order.items.map((i) => (
            <tr key={i.id}>
              <td>{i.name}</td>
              <td>{i.qty}</td>
              <td>{money(i.price)}</td>
              <td>{money(i.price * i.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="r-totals">
        {order.tax > 0 && (
          <>
            {/* orders saved before GST was removed keep their GST line */}
            <div><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
            <div><span>GST (5%)</span><span>{money(order.tax)}</span></div>
          </>
        )}
        <div className="r-grand"><span>Total</span><span>{money(order.total)}</span></div>
      </div>

      <p className="r-thanks">Thank you! Visit again.</p>
    </div>
  );
}

// Pop-up with the bill. The print window opens only when you click "Print bill"
// (pass autoPrint to open it straight away).
function Receipt({ order, onClose, autoPrint = false }) {
  useEffect(() => {
    if (!autoPrint) return;
    const t = setTimeout(() => window.print(), 300);
    return () => clearTimeout(t);
  }, [autoPrint]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="receipt-overlay" role="dialog" aria-modal="true" aria-label="Bill">
      <ReceiptSheet order={order} />
      <div className="receipt-actions">
        <button className="r-print" onClick={() => window.print()}>Print bill</button>
        <button className="r-close" onClick={onClose}>Close</button>
      </div>
    </div>,
    document.body
  );
}

export default Receipt;
