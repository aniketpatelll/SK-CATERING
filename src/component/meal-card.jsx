import "./meal-card.css";

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
      <img src={icon} alt={name} className="meal-icon" aria-hidden="true" />
      <span className="meal-name">{name}</span>
      <span className="meal-price">₹{price.toFixed(2)}</span>
    </button>
  );
}

export default MealCard;
