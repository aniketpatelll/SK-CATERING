import "./veg-filter.css";

const OPTIONS = [
  { value: "both", label: "Both" },
  { value: "veg", label: "Pure Veg" },
  { value: "nonveg", label: "Non Veg" },
];

// Switch: Both (default) / Pure Veg / Non Veg
function VegFilter({ value, onChange }) {
  return (
    <div className="veg-filter" role="group" aria-label="Veg or non veg">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          className={`${o.value} ${value === o.value ? "on" : ""}`}
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.value !== "both" && <span className="mark" aria-hidden="true" />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default VegFilter;
