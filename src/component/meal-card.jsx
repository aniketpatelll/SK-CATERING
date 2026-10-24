import { withBase } from "../url";
import "./meal-card.css";

// items.json "icon" can be an emoji or a picture path such as "/items/samosa.png"
const isPicture = (v) => /\.(png|jpe?g|webp|svg|gif)$/i.test(v) || /^(https?:|data:|blob:)/i.test(v);

// One card for every menu item, on every page.
// `veg` is optional: pass true/false to show the veg / non-veg marker.
function MealCard({ name, price, icon, veg, onAdd }) {
  return (
    <button className="meal-card" onClick={onAdd}>
      {typeof veg === "boolean" && (
        <span
          className={`diet ${veg ? "veg" : "nonveg"}`}
          title={veg ? "Veg" : "Non-veg"}
        />
      )}
      <span className="meal-icon" aria-hidden="true">
        {isPicture(icon) ? <img src={withBase(icon)} alt="" loading="lazy" /> : icon}
      </span>
      <span className="meal-name">{name}</span>
      <span className="meal-price">₹{price.toFixed(2)}</span>
    </button>
  );
}

export default MealCard;
