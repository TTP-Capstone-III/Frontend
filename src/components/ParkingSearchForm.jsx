import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationSearchInput from "./LocationSearchInput";

const VEHICLE_OPTIONS = [
  { value: "COMPACT", label: "Small / compact car" },
  { value: "SEDAN", label: "Sedan / wagon" },
  { value: "SMALL_SUV", label: "Small SUV / crossover" },
  { value: "LARGE_SUV_MINIVAN", label: "Large SUV / minivan" },
  { value: "PICKUP", label: "Pickup truck" },
  { value: "OTHER_NOT_SURE", label: "Other / Not sure" },
];

export function getVehicleLabel(vehicleCategory) {
  const option = VEHICLE_OPTIONS.find(
    (vehicleOption) => vehicleOption.value === vehicleCategory,
  );

  return option ? option.label : vehicleCategory;
}

function formatDateTimeInput(date) {
  // datetime-local inputs require YYYY-MM-DDTHH:mm without a timezone suffix.
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function createDefaultTimes() {
  // Start homepage discovery one week ahead with a two-hour parking window.
  const startTime = new Date();
  startTime.setDate(startTime.getDate() + 7);
  startTime.setHours(12, 0, 0, 0);

  const endTime = new Date(startTime);
  endTime.setHours(14, 0, 0, 0);

  return {
    startTime: formatDateTimeInput(startTime),
    endTime: formatDateTimeInput(endTime),
  };
}

const DEFAULT_TIMES = createDefaultTimes();

const DEFAULT_SEARCH_FORM = {
  location: "",
  destinationLat: "",
  destinationLng: "",
  startTime: DEFAULT_TIMES.startTime,
  endTime: DEFAULT_TIMES.endTime,
  driverVehicleCategory: "COMPACT",
};

function createInitialForm(initialValues) {
  return {
    ...DEFAULT_SEARCH_FORM,
    ...initialValues,
    startTime: initialValues.startTime
      ? formatDateTimeInput(new Date(initialValues.startTime))
      : DEFAULT_SEARCH_FORM.startTime,
    endTime: initialValues.endTime
      ? formatDateTimeInput(new Date(initialValues.endTime))
      : DEFAULT_SEARCH_FORM.endTime,
  };
}

export default function ParkingSearchForm({
  initialValues = {},
  compact = false,
  onUseCurrentLocation,
  findingLocation = false,
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => createInitialForm(initialValues));
  const [error, setError] = useState("");

  function updateForm(field, value) {
    // Update one form field without removing the other search values.
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function handleLocationChange(locationText) {
    // Typed text is not a confirmed Mapbox result, so discard old coordinates.
    setForm((currentForm) => ({
      ...currentForm,
      location: locationText,
      destinationLat: "",
      destinationLng: "",
    }));
  }

  function handleLocationSelect(selectedLocation) {
    // A selected suggestion provides both its readable label and coordinates.
    setForm((currentForm) => ({
      ...currentForm,
      location: selectedLocation.label,
      destinationLat: selectedLocation.latitude,
      destinationLng: selectedLocation.longitude,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.location.trim()) {
      setError("Enter an address, landmark, or neighborhood.");
      return;
    }

    const latitude = Number(form.destinationLat);
    const longitude = Number(form.destinationLng);

    if (
      form.destinationLat === "" ||
      form.destinationLng === "" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      setError("Choose a location from the suggestions.");
      return;
    }

    const startTime = new Date(form.startTime);
    const endTime = new Date(form.endTime);

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      setError("Choose valid arrival and departure times.");
      return;
    }

    if (endTime <= startTime) {
      setError("Departure must be later than arrival.");
      return;
    }

    const params = new URLSearchParams({
      location: form.location.trim(),
      destinationLat: String(latitude),
      destinationLng: String(longitude),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      driverVehicleCategory: form.driverVehicleCategory,
      sort: "distance",
    });

    setError("");
    navigate(`/search?${params.toString()}`);
  }

  const formClassName = compact
    ? "listing-searchbar listing-searchbar-compact"
    : "listing-searchbar";

  return (
    <>
      <form className={formClassName} onSubmit={handleSubmit}>
        <div className="listing-search-field listing-location-field">
          <span>Where</span>

          <LocationSearchInput
            value={form.location}
            onChange={handleLocationChange}
            onSelect={handleLocationSelect}
            onUseCurrentLocation={onUseCurrentLocation}
            findingLocation={findingLocation}
            placeholder="Address, landmark, or neighborhood"
          />
        </div>

        <div className="listing-search-field listing-time-field">
          <div className="listing-date-inputs">
            <label>
              <small>Arrival · Eastern Time</small>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(event) =>
                  updateForm("startTime", event.target.value)
                }
                required
              />
            </label>

            <label>
              <small>Departure · Eastern Time</small>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={(event) => updateForm("endTime", event.target.value)}
                required
              />
            </label>
          </div>
        </div>

        <label className="listing-search-field listing-vehicle-field">
          <span>Vehicle</span>
          <select
            value={form.driverVehicleCategory}
            onChange={(event) =>
              updateForm("driverVehicleCategory", event.target.value)
            }
          >
            {VEHICLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button className="listing-search-button" type="submit">
          Search parking <span aria-hidden="true">→</span>
        </button>
      </form>

      {error ? (
        <p className="listing-message listing-error app-alert" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
