import { useState } from "react";
import "./customers.css"; // shared filter chips
import "./dashboard.css";

const PERIODS = ["Today", "7 days", "30 days", "All time"];

const money = (n) => `₹${Number(n).toFixed(2)}`;
const compact = (n) => (n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${Math.round(n)}`);
const dayKey = (d) => d.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

function inPeriod(iso, period) {
  const d = new Date(iso);
  const now = new Date();
  if (period === "Today") return d.toDateString() === now.toDateString();
  if (period === "7 days") return now - d <= 7 * 864e5;
  if (period === "30 days") return now - d <= 30 * 864e5;
  return true;
}

function lastDays(orders, count) {
  const days = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      key: dayKey(d),
      label: d.toLocaleDateString("en-IN", { weekday: "short" }),
      date: d.getDate(),
      total: 0,
      orders: 0,
      today: i === 0,
    });
  }
  orders.forEach((o) => {
    const day = days.find((x) => x.key === dayKey(new Date(o.createdAt)));
    if (day) {
      day.total += o.total;
      day.orders += 1;
    }
  });
  return days;
}

function Dashboard({ orders, onNavigate }) {
  const [period, setPeriod] = useState("7 days");

  const shown = orders.filter((o) => inPeriod(o.createdAt, period));
  const sales = shown.reduce((s, o) => s + o.total, 0);
  const itemsSold = shown.reduce((s, o) => s + o.items.reduce((n, i) => n + i.qty, 0), 0);
  const avg = shown.length ? sales / shown.length : 0;

  // Top selling items
  const byItem = {};
  shown.forEach((o) =>
    o.items.forEach((i) => {
      byItem[i.name] ??= { name: i.name, qty: 0, revenue: 0 };
      byItem[i.name].qty += i.qty;
      byItem[i.name].revenue += i.qty * i.price;
    })
  );
  const topItems = Object.values(byItem).sort((a, b) => b.qty - a.qty).slice(0, 5);
  const topMax = topItems[0]?.qty || 1;

  // Customers vs Railway
  const split = ["Customers", "Railway"].map((name) => {
    const list = shown.filter((o) => o.source === name);
    return { name, orders: list.length, total: list.reduce((s, o) => s + o.total, 0) };
  });

  // Chart: last 7 days (always)
  const days = lastDays(orders, 7);
  const dayMax = Math.max(...days.map((d) => d.total), 1);

  const recent = orders.slice(0, 5);

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dash-date">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="chip-row">
          {PERIODS.map((p) => (
            <button key={p} className={`chip ${period === p ? "on" : ""}`} onClick={() => setPeriod(p)}>
              {p}
            </button>
          ))}
        </div>
      </header>

      <div className="quick">
        <button className="quick-btn red" onClick={() => onNavigate("Customers")}>
          <span aria-hidden="true">🍔</span> New customer order
        </button>
        <button className="quick-btn yellow" onClick={() => onNavigate("Railway")}>
          <span aria-hidden="true">🚆</span> New railway order
        </button>
        <button className="quick-btn white" onClick={() => onNavigate("History")}>
          <span aria-hidden="true">🧾</span> View history
        </button>
      </div>

      <div className="kpis">
        <div className="kpi"><span>Sales</span><strong>{money(sales)}</strong></div>
        <div className="kpi"><span>Orders</span><strong>{shown.length}</strong></div>
        <div className="kpi"><span>Average order</span><strong>{money(avg)}</strong></div>
        <div className="kpi"><span>Items sold</span><strong>{itemsSold}</strong></div>
      </div>

      <div className="dash-grid">
        <section className="panel wide">
          <h2>Sales, last 7 days</h2>
          <div className="bars" role="img" aria-label="Bar chart of sales for the last 7 days">
            {days.map((d) => (
              <div key={d.key} className="bar-col" title={`${d.label} ${d.date}: ${money(d.total)}, ${d.orders} orders`}>
                <span className="bar-value">{d.total ? compact(d.total) : ""}</span>
                <div className="bar-track">
                  <div
                    className={`bar ${d.today ? "today" : ""}`}
                    style={{ height: `${(d.total / dayMax) * 100}%` }}
                  />
                </div>
                <span className="bar-label">{d.label}<small>{d.date}</small></span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Customers vs Railway</h2>
          {shown.length === 0 ? (
            <p className="muted">No orders in this period.</p>
          ) : (
            <>
              <div className="split-bar" aria-hidden="true">
                {split.map((s) => (
                  <div
                    key={s.name}
                    className={s.name === "Railway" ? "rail" : "cust"}
                    style={{ width: `${sales ? (s.total / sales) * 100 : 0}%` }}
                  />
                ))}
              </div>
              {split.map((s) => (
                <div key={s.name} className="split-row">
                  <span className={`dot ${s.name === "Railway" ? "rail" : "cust"}`} />
                  <span>{s.name}</span>
                  <small>{s.orders} orders</small>
                  <strong>{money(s.total)}</strong>
                </div>
              ))}
            </>
          )}
        </section>

        <section className="panel">
          <h2>Top selling items</h2>
          {topItems.length === 0 ? (
            <p className="muted">No items sold in this period.</p>
          ) : (
            topItems.map((t) => (
              <div key={t.name} className="top-row">
                <div className="top-head">
                  <span>{t.name}</span>
                  <small>{t.qty} sold · {money(t.revenue)}</small>
                </div>
                <div className="top-track">
                  <div className="top-fill" style={{ width: `${(t.qty / topMax) * 100}%` }} />
                </div>
              </div>
            ))
          )}
        </section>

        <section className="panel wide">
          <div className="panel-head">
            <h2>Recent orders</h2>
            <button className="link" onClick={() => onNavigate("History")}>See all</button>
          </div>
          {recent.length === 0 ? (
            <p className="muted">No orders yet. Start with a customer or railway order.</p>
          ) : (
            recent.map((o) => (
              <div key={o.id} className="recent-row">
                <span className="order-no">#{o.number}</span>
                <span className="recent-main">
                  <strong>{o.source === "Railway" ? `${o.train?.id} ${o.train?.name}` : o.customer}</strong>
                  <small>
                    {new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </small>
                </span>
                <span className={`tag ${o.source === "Railway" ? "rail" : "cust"}`}>{o.source}</span>
                <strong>{money(o.total)}</strong>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
