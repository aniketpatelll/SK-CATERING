import { useState } from "react";
import MealCard from "../component/meal-card";
import QtyControl from "../component/qty-control";
import items from "../data/items.json";
import stations from "../data/stations.json";
import { withBase } from "../url";
import trains from "../data/trains.json";
import "./customers.css"; // shared billing layout (menu area, bill panel, chips, tiles)
import "./railway.css";

// Trains come from data/trains.json. Each train lists the stations it runs from.
// filter(Boolean) skips any empty entry (e.g. from an extra comma).
const TRAINS = trains.filter(Boolean);

// Stations come from data/stations.json: name, image path, image info (alt + caption) and optional imagePosition
const STATIONS = stations.filter(Boolean);

// Meals come from data/items.json (type "railway")
const MEALS = items.filter((i) => [].concat(i?.type ?? []).includes("railway"));
const SLOTS = ["All", ...new Set(MEALS.map((i) => i.category))];

const TAX_RATE = 0.05;
const money = (n) => `₹${n.toFixed(2)}`;

function Railway({ onSaveOrder }) {
  const [trainId, setTrainId] = useState(null);
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [seat, setSeat] = useState("");
  const [vendor, setVendor] = useState("");
  const [mode, setMode] = useState("passenger"); // passenger | vendor
  const [station, setStation] = useState(null);
  const [slot, setSlot] = useState("All");
  const [cart, setCart] = useState([]);

  const chooseStation = (st) => {
    setStation(st);
    setTrainId(null); // trains differ per station, so pick again
  };

  const stationTrains = station
    ? TRAINS.filter((t) => [].concat(t.stations ?? []).includes(station))
    : [];
  const train = stationTrains.find((t) => t.id === trainId) ?? null;
  const meals = slot === "All" ? MEALS : MEALS.filter((m) => m.category === slot);

  const add = (meal) =>
    setCart((c) => {
      const found = c.find((x) => x.id === meal.id);
      return found
        ? c.map((x) => (x.id === meal.id ? { ...x, qty: x.qty + 1 } : x))
        : [...c, { ...meal, qty: 1 }];
    });

  const change = (id, delta) =>
    setCart((c) =>
      c.map((x) => (x.id === id ? { ...x, qty: x.qty + delta } : x)).filter((x) => x.qty > 0)
    );

  const setQty = (id, qty) =>
    setCart((c) => c.map((x) => (x.id === id ? { ...x, qty } : x)));

  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const count = cart.reduce((s, x) => s + x.qty, 0);
  const ready =
    train && station && cart.length > 0 && (mode === "passenger" || vendor.trim());

  const reset = () => {
    setTrainId(null);
    setCart([]);
    setDate("");
    setSeat("");
    setVendor("");
    setStation(null);
    setPassengers(1);
  };

  return (
    <div className="billing">
      <section className="menu-area">
        <header className="menu-header">
          <h1>Railway meals</h1>
        </header>

        <h2 className="step-title">1. Choose station</h2>
        <div className="stations" role="radiogroup" aria-label="Choose station">
          {STATIONS.map((st) => (
            <button
              key={st.name}
              role="radio"
              aria-checked={station === st.name}
              className={`station ${station === st.name ? "on" : ""}`}
              onClick={() => chooseStation(st.name)}
            >
              {st.image && (
                <img
                  className="station-img"
                  src={withBase(st.image)}
                  alt={st.imageInfo?.alt ?? st.name}
                  style={{ objectPosition: st.imagePosition }}
                  loading="lazy"
                />
              )}
              <span className="station-body">
                <strong>{st.name}</strong>
                {st.imageInfo?.caption && <small>{st.imageInfo.caption}</small>}
              </span>
            </button>
          ))}
        </div>

        <h2 className="step-title">2. Choose train</h2>
        {!station && <p className="train-hint">Choose a station to see its trains.</p>}
        {station && stationTrains.length === 0 && (
          <p className="train-hint">No trains listed for {station}.</p>
        )}
        <div className="trains" role="radiogroup" aria-label="Choose train">
          {stationTrains.map((t) => (
            <button
              key={t.id}
              role="radio"
              aria-checked={trainId === t.id}
              className={`train ${trainId === t.id ? "on" : ""}`}
              onClick={() => setTrainId(t.id)}
            >
              <span className="train-no">{t.id}</span>
              <span className="train-main">
                <strong>{t.name}</strong>
                <small>{t.from} → {t.to}</small>
              </span>
              <span className="train-time">
                <strong>{t.dep} – {t.arr}</strong>
                <small>{t.dur}</small>
              </span>
            </button>
          ))}
        </div>

        <h2 className="step-title">3. Journey details</h2>
        <div className="mode-switch" role="group" aria-label="Order for">
          {[
            ["passenger", "Passengers"],
            ["vendor", "Vendor"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={mode === value ? "on" : ""}
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="trip-fields">
          <label>
            Journey date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          {mode === "passenger" ? (
            <>
              <label>
                Passengers
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={passengers}
                  onChange={(e) => setPassengers(Math.max(1, Number(e.target.value) || 1))}
                />
              </label>
              <label>
                Coach / seat
                <input placeholder="e.g. B3 / 42" value={seat} onChange={(e) => setSeat(e.target.value)} />
              </label>
            </>
          ) : (
            <label>
              Vendor name
              <input placeholder="Vendor name" value={vendor} onChange={(e) => setVendor(e.target.value)} />
            </label>
          )}
        </div>

        <h2 className="step-title">4. Choose meals</h2>
        <div className="categories">
          {SLOTS.map((s) => (
            <button key={s} className={`chip ${slot === s ? "on" : ""}`} onClick={() => setSlot(s)}>
              {s}
            </button>
          ))}
        </div>

        <div className="items">
          {meals.map((m) => (
            <MealCard
              key={m.id}
              name={m.name}
              price={m.price}
              icon={m.icon}
              veg={m.veg}
              onAdd={() => add(m)}
            />
          ))}
        </div>
      </section>

      <aside className="bill">
        <div className="bill-head">
          <h2>Train order</h2>
          <span className="badge">{count}</span>
        </div>

        <div className={`trip-summary ${train && station ? "" : "none"}`}>
          <strong>{train ? `${train?.id} ${train?.name}` : "No train chosen"}</strong>
          {train && <span>{train?.from} → {train?.to}</span>}
          <span>Station: {station ?? "not chosen"}</span>
          {mode === "vendor" ? (
            <span>Vendor: {vendor.trim() || "not entered"}</span>
          ) : null}
          <span>
            {[
              date || "Date not set",
              mode === "passenger" && `${passengers} passenger${passengers > 1 ? "s" : ""}`,
              mode === "passenger" && seat,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </div>

        <div className="bill-lines">
          {cart.length === 0 ? (
            <p className="empty">No meals yet. Tap a meal to add it.</p>
          ) : (
            cart.map((x) => (
              <div key={x.id} className="line">
                <div className="line-info">
                  <strong>{x.name}</strong>
                  <small>{money(x.price)} each</small>
                </div>
                <QtyControl
                  qty={x.qty}
                  name={x.name}
                  onStep={(d) => change(x.id, d)}
                  onSet={(n) => setQty(x.id, n)}
                />
                <div className="line-total">{money(x.price * x.qty)}</div>
              </div>
            ))
          )}
        </div>

        <div className="totals">
          <div><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div><span>GST (5%)</span><span>{money(tax)}</span></div>
          <div className="grand"><span>Total</span><span>{money(total)}</span></div>
        </div>

        <div className="actions">
          <button className="clear" onClick={reset} disabled={!train && !cart.length}>Clear</button>
          <button
            className="pay"
            disabled={!ready}
            onClick={() => {
              onSaveOrder?.({
                source: "Railway",
                train: { id: train.id, name: train.name, from: train.from, to: train.to },
                date,
                orderFor: mode,
                passengers: mode === "passenger" ? passengers : null,
                seat: mode === "passenger" ? seat : "",
                vendor: mode === "vendor" ? vendor.trim() : "",
                station,
                items: cart.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
                subtotal,
                tax,
                total,
              });
              reset();
            }}
          >
            Confirm {money(total)}
          </button>
        </div>
      </aside>
    </div>
  );
}

export default Railway;
