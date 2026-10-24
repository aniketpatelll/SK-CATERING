import { useState } from "react";
import { exportWord } from "../exportWord";
import { saveFile } from "../saveFile";
import Receipt from "../component/receipt";
import ConfirmDialog from "../component/confirm-dialog";
import stations from "../data/stations.json";
import "./customers.css"; // shared filter chips
import "./history.css";

const money = (n) => `₹${Number(n).toFixed(2)}`;
const when = (iso) =>
  new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

const SOURCES = ["All", "Customers", "Railway"];
const PERIODS = ["All time","Today", "Last 7 days", "Last 30 days"];
const STATION_NAMES = stations.filter(Boolean).map((s) => s.name);

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function inPeriod(iso, period) {
  const d = new Date(iso);
  const now = new Date();
  if (period === "Today") return d.toDateString() === now.toDateString();
  if (period === "Last 7 days") return now - d <= 7 * 24 * 60 * 60 * 1000;
  if (period === "Last 30 days") return now - d <= 30 * 24 * 60 * 60 * 1000;
  return true;
}

function matches(o, q) {
  if (!q) return true;
  const text = [
    o.number,
    o.customer,
    o.orderType,
    o.train?.id,
    o.train?.name,
    o.train?.from,
    o.train?.to,
    o.station,
    o.vendor,
    ...o.items.map((i) => i.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return text.includes(q.toLowerCase());
}

function exportCsv(orders, station = "All") {
  const rows = [
    ["Order", "Date", "Type", "Station", "Customer / Train", "Items", "Subtotal", "GST", "Total"],
    ...orders.map((o) => [
      o.number,
      when(o.createdAt),
      o.source,
      o.station || "",
      o.source === "Railway" ? `${o.train?.id} ${o.train?.name}` : o.customer,
      o.items.map((i) => `${i.qty} x ${i.name}`).join("; "),
      o.subtotal.toFixed(2),
      o.tax.toFixed(2),
      o.total.toFixed(2),
    ]),
  ];
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  return saveFile(
    new Blob(["\ufeff" + csv], { type: "text/csv" }),
    `ajs-order-history${station === "All" ? "" : `-${slug(station)}`}-${new Date().toLocaleDateString("en-CA")}.csv`,
    "CSV file",
    "text/csv",
    ".csv"
  );
}

function History({ orders, setOrders }) {
  const [source, setSource] = useState("All");
  const [period, setPeriod] = useState("All time");
  const [station, setStation] = useState("All"); // All or a station name
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [confirm, setConfirm] = useState(null); // delete confirmation pop-up

  const shown = orders.filter(
    (o) =>
      (source === "All" || o.source === source) &&
      inPeriod(o.createdAt, period) &&
      (station === "All" || o.station === station) &&
      matches(o, query.trim())
  );

  const todayOrders = orders.filter((o) => inPeriod(o.createdAt, "Today"));
  const sum = (list) => list.reduce((s, o) => s + o.total, 0);

  const remove = (o) =>
    setConfirm({
      title: `Delete order #${o.number}?`,
      message: "This order will be removed from History.",
      confirmLabel: "Delete order",
      run: () => setOrders((prev) => prev.filter((x) => x.id !== o.id)),
    });

  const clearAll = () =>
    setConfirm({
      title: "Delete all order history?",
      message: `All ${orders.length} order${orders.length === 1 ? "" : "s"} will be deleted for good. This cannot be undone.`,
      confirmLabel: "Delete all",
      run: () => setOrders([]),
    });

  return (
    <div className="history">
      <header className="history-header">
        <h1>Order history</h1>
        <div className="history-actions">
          <button onClick={() => exportCsv(shown, station)} disabled={!shown.length}>
            Export CSV
          </button>
          <button onClick={() => exportWord(shown, station === "All" ? "" : station)} disabled={!shown.length}>
            Export Word
          </button>
          <button className="danger" onClick={clearAll} disabled={!orders.length}>
            Delete all
          </button>
        </div>
      </header>

      <div className="stats">
        <div className="stat">
          <span>Total orders</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="stat">
          <span>Total sales</span>
          <strong>{money(sum(orders))}</strong>
        </div>
        <div className="stat">
          <span>Today</span>
          <strong>{money(sum(todayOrders))}</strong>
          <small>{todayOrders.length} orders</small>
        </div>
      </div>

      <div className="filters">
        <input
          className="search"
          type="search"
          placeholder="Search order number, customer, train or item"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chip-row">
          {SOURCES.map((s) => (
            <button key={s} className={`chip ${source === s ? "on" : ""}`} onClick={() => setSource(s)}>
              {s}
            </button>
          ))}
        </div>
        <div className="chip-row">
          {["All", ...STATION_NAMES].map((s) => (
            <button key={s} className={`chip ${station === s ? "on" : ""}`} onClick={() => setStation(s)}>
              {s === "All" ? "All stations" : s}
            </button>
          ))}
        </div>
        <div className="chip-row">
          {PERIODS.map((p) => (
            <button key={p} className={`chip ${period === p ? "on" : ""}`} onClick={() => setPeriod(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="history-empty">
          No orders yet. Orders appear here after you tap Charge on Customers or Confirm on Railway.
        </p>
      ) : shown.length === 0 ? (
        <p className="history-empty">No orders match these filters.</p>
      ) : (
        <div className="orders">
          {shown.map((o) => {
            const open = openId === o.id;
            return (
              <article key={o.id} className={`order ${open ? "open" : ""}`}>
                <button
                  className="order-row"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : o.id)}
                >
                  <span className="order-no">#{o.number}</span>
                  <span className="order-main">
                    <strong>
                      {o.source === "Railway"
                        ? `${o.train?.id} ${o.train?.name}`
                        : o.customer}
                    </strong>
                    <small>
                      {[
                        when(o.createdAt),
                        o.source === "Railway"
                          ? `${o.train?.from} → ${o.train?.to}`
                          : o.orderType,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </small>
                  </span>
                  <span className={`tag ${o.source === "Railway" ? "rail" : "cust"}`}>
                    {o.source}
                  </span>
                  <span className="order-total">{money(o.total)}</span>
                </button>

                {open && (
                  <div className="order-detail">
                    {o.source === "Railway" && (
                      <p className="trip">
                        {[
                          o.station && `${o.station} station`,
                          `Journey ${o.date || "date not set"}`,
                          o.passengers
                            ? `${o.passengers} passenger${o.passengers > 1 ? "s" : ""}`
                            : null,
                          o.seat,
                          o.vendor && `Vendor ${o.vendor}`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                    {o.items.map((i) => (
                      <div key={i.id} className="detail-line">
                        <span>{i.qty} × {i.name}</span>
                        <span>{money(i.price * i.qty)}</span>
                      </div>
                    ))}
                    <div className="detail-line sub"><span>Subtotal</span><span>{money(o.subtotal)}</span></div>
                    <div className="detail-line sub"><span>GST (5%)</span><span>{money(o.tax)}</span></div>
                    <div className="detail-line grand"><span>Total</span><span>{money(o.total)}</span></div>
                    <div className="detail-actions">
                      <button onClick={() => setReceipt(o)}>View bill</button>
                      <button className="danger" onClick={() => remove(o)}>Delete order</button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {receipt && <Receipt order={receipt} onClose={() => setReceipt(null)} />}

      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            confirm.run();
            setConfirm(null);
          }}
        />
      )}
    </div>
  );
}

export default History;
