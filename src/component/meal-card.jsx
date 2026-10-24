import "./meal-card.css";

// One card for every menu item, on every page.
function MealCard({ name, price, icon, veg, onAdd }) {
// Support GitHub Pages deployment using Vite's base path.
const imageSrc = icon
? `${import.meta.env.BASE_URL}${icon.replace(/^\/+/, "").split("/").map(encodeURIComponent).join("/")}`
: "";

return ( <button className="meal-card" onClick={onAdd}>
{typeof veg === "boolean" && (
<span
className={`diet ${veg ? "veg" : "nonveg"}`}
title={veg ? "Veg" : "Non-veg"}
/>
)}


  <img
    src={imageSrc}
    alt={name}
    className="meal-icon"
    onError={(e) => {
      console.error("Failed to load image:", e.currentTarget.src);
    }}
  />

  <span className="meal-name">{name}</span>
  <span className="meal-price">₹{price.toFixed(2)}</span>
</button>


);
}

export default MealCard;
