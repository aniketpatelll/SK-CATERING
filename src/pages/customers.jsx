import { useState } from "react";
import MealCard from "../component/meal-card";
import QtyControl from "../component/qty-control";
import VegFilter from "../component/veg-filter";
import Receipt from "../component/receipt";
import items from "../data/items.json";
import "./customers.css";

const MENU = items.filter((i) => [].concat(i?.type ?? []).includes("customer"));
const CATEGORIES = ["All", ...new Set(MENU.map((i) => i.category))];

const TAX_RATE = 0.05;
const money = (n) => `₹${n.toFixed(2)}`;

function Customers({ onSaveOrder }) {
  const [category, setCategory] = useState("All");
  const [diet, setDiet] = useState("both"); // both | veg | nonveg
  const [receipt, setReceipt] = useState(null); // bill shown after Charge
  const [customer, setCustomer] = useState("");
  const [cart, setCart] = useState([]);

  const items = MENU.filter(
    (m) =>
      (category === "All" || m.category === category) &&
      (diet === "both" || (diet === "veg") === m.veg)
  );

  const add = (item) =>
    setCart((c) => {
      const found = c.find((x) => x.id === item.id);
      return found
        ? c.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x))
        : [...c, { ...item, qty: 1 }];
    });

  const change = (id, delta) =>
    setCart((c) =>
      c
        .map((x) => (x.id === id ? { ...x, qty: x.qty + delta } : x))
        .filter((x) => x.qty > 0)
    );

  const setQty = (id, qty) =>
    setCart((c) => c.map((x) => (x.id === id ? { ...x, qty } : x)));

  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const count = cart.reduce((s, x) => s + x.qty, 0);

  return (
    <div className="billing">
      <section className="menu-area">
        <header className="menu-header">
          <h1>AJS CATERING</h1>
          <VegFilter value={diet} onChange={setDiet} />
        </header>

        <div className="categories">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`chip ${category === c ? "on" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="items">
          {items.map((item) => (
            <MealCard
              key={item.id}
              name={item.name}
              price={item.price}
              icon={item.icon}
              veg={item.veg}
              onAdd={() => add(item)}
            />
          ))}
        </div>
        {items.length === 0 && <p className="no-items">No items match this filter.</p>}
      </section>

      <aside className="bill">
        <div className="bill-head">
          <h2>Your order</h2>
          <span className="badge">{count}</span>
        </div>

        <input
          className="customer-input"
          placeholder="Customer name"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
        />

        <div className="bill-lines">
          {cart.length === 0 ? (
            <p className="empty">No items yet. Tap an item to add it.</p>
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
          <button className="clear" onClick={() => setCart([])} disabled={!cart.length}>
            Clear
          </button>
          <button
            className="pay"
            disabled={!cart.length}
            onClick={() => {
              const data = {
                source: "Customers",
                customer: customer.trim() || "Guest",
                items: cart.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
                subtotal,
                tax,
                total,
              };
              // save to History, then open the bill and the print window
              const saved =
                onSaveOrder?.(data) ?? { ...data, createdAt: new Date().toISOString() };
              setReceipt(saved);
              setCart([]);
              setCustomer("");
            }}
          >
            Charge {money(total)}
          </button>
        </div>
      </aside>

      {receipt && <Receipt order={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}

export default Customers;
