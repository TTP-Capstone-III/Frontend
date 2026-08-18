const VEHICLE_CATEGORIES = [
  { value: "COMPACT", label: "Compact" },
  { value: "SEDAN", label: "Sedan" },
  { value: "SMALL_SUV", label: "Small SUV" },
  { value: "LARGE_SUV_MINIVAN", label: "Large SUV / Minivan" },
  { value: "PICKUP", label: "Pickup Truck" },
  { value: "OTHER_NOT_SURE", label: "Other / Not sure" },
];

function VehicleSelect({ value, onChange, required = true }) {
  return (
    <div className="reservation-field">
      <label htmlFor="vehicleCategory">
        Vehicle type
      </label>
      <select
        id="vehicleCategory"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="" disabled>
          Select your vehicle type
        </option>
        {VEHICLE_CATEGORIES.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default VehicleSelect;
