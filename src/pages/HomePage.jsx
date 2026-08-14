import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiRequest from "../api/client";
import "../styles/pages/home-page.css";

const LOCATIONS = {
  "New York City": {
    destinationLat: 40.7128,
    destinationLng: -74.006,
    west: -74.26,
    south: 40.49,
    east: -73.7,
    north: 40.93,
  },
  Manhattan: {
    destinationLat: 40.758,
    destinationLng: -73.9855,
    west: -74.03,
    south: 40.69,
    east: -73.9,
    north: 40.88,
  },
  Brooklyn: {
    destinationLat: 40.6782,
    destinationLng: -73.9442,
    west: -74.05,
    south: 40.56,
    east: -73.83,
    north: 40.74,
  },
  Queens: {
    destinationLat: 40.7282,
    destinationLng: -73.7949,
    west: -73.97,
    south: 40.54,
    east: -73.7,
    north: 40.81,
  },
  Bronx: {
    destinationLat: 40.8448,
    destinationLng: -73.8648,
    west: -73.94,
    south: 40.78,
    east: -73.75,
    north: 40.92,
  },
  "Staten Island": {
    destinationLat: 40.5795,
    destinationLng: -74.1502,
    west: -74.26,
    south: 40.49,
    east: -74.05,
    north: 40.66,
  },
};

const VEHICLE_OPTIONS = [
  { value: "COMPACT", label: "Small / compact car" },
  { value: "SEDAN", label: "Sedan / wagon" },
  { value: "SMALL_SUV", label: "Small SUV / crossover" },
  { value: "LARGE_SUV_MINIVAN", label: "Large SUV / minivan" },
  { value: "PICKUP", label: "Pickup truck" },
  { value: "OTHER_NOT_SURE", label: "Other / Not sure" },
];

function getVehicleLabel(vehicleCategory) {
  const option = VEHICLE_OPTIONS.find(
    (vehicleOption) => vehicleOption.value === vehicleCategory,
  );

  return option ? option.label : vehicleCategory;
}

function formatDateTimeInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function createDefaultTimes() {
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

const DEFAULT_FORM = {
  location: "New York City",
  startTime: DEFAULT_TIMES.startTime,
  endTime: DEFAULT_TIMES.endTime,
  driverVehicleCategory: "COMPACT",
};

export default function HomePage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function updateForm(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function loadHomepageListings() {
    setLoading(true);
    setError("");

    try {
      const location = LOCATIONS[DEFAULT_FORM.location];
      const query = new URLSearchParams({
        location: DEFAULT_FORM.location,
        startTime: new Date(DEFAULT_FORM.startTime).toISOString(),
        endTime: new Date(DEFAULT_FORM.endTime).toISOString(),
        driverVehicleCategory: DEFAULT_FORM.driverVehicleCategory,
        destinationLat: location.destinationLat,
        destinationLng: location.destinationLng,
        west: location.west,
        south: location.south,
        east: location.east,
        north: location.north,
        sort: "distance",
      });

      const response = await apiRequest(`/api/listings?${query}`);
      const randomListings = [...response.items]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

      setListings(randomListings);
    } catch (requestError) {
      setListings([]);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (new Date(form.endTime) <= new Date(form.startTime)) {
      setError("Departure must be later than arrival.");
      return;
    }

    // The search-results page and map will use these form values later.
    setError("");
  }

  useEffect(() => {
    loadHomepageListings();
  }, []);

  return (
    <main className="listing-page">
      <section className="listing-header">
        <p className="listing-eyebrow">Easy parking, made neighborly</p>
        <h1>
          Park closer. <span>Pay less.</span>
        </h1>

        <form className="listing-searchbar" onSubmit={handleSubmit}>
          <label className="listing-search-field listing-location-field">
            <span>Where</span>
            <select
              value={form.location}
              onChange={(event) => updateForm("location", event.target.value)}
            >
              {Object.keys(LOCATIONS).map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>

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
                  onChange={(event) =>
                    updateForm("endTime", event.target.value)
                  }
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

        <p className="home-trust-message">
          <span>✓</span> Clear fit guidance · Private address until booking · No
          surprise total
        </p>

        {error ? (
          <p className="listing-message listing-error">{error}</p>
        ) : null}
      </section>

      <section className="listing-results">
        <div className="listing-results-heading">
          <div>
            <p>Available now</p>
            <h2>Explore parking spots</h2>
          </div>
        </div>

        {loading ? (
          <p className="listing-message">Loading parking spots…</p>
        ) : null}

        {!loading && listings.length === 0 && !error ? (
          <p className="listing-message">No parking spots are available yet.</p>
        ) : null}

        {!loading && listings.length > 0 ? (
          <div className="listing-grid">
            {listings.map((listing) => (
              <article className="listing-card" key={listing.id}>
                <div className="listing-card-image">
                  <img
                    src={listing.imageUrl}
                    alt={`Parking space: ${listing.title}`}
                  />
                </div>

                <div className="listing-card-content">
                  <div className="listing-card-title">
                    <h3>{listing.title}</h3>
                    <strong>
                      ${(listing.hourlyPriceCents / 100).toFixed(2)}
                      <small> / hour</small>
                    </strong>
                  </div>
                  <p>
                    {listing.neighborhood} · {listing.zipCode}
                  </p>
                  <p>
                    Up to{" "}
                    {getVehicleLabel(listing.maxVehicleCategory).toLowerCase()}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="home-how-it-works">
        <div className="home-bottom-container">
          <div className="home-section-heading">
            <p>Simple by design</p>
            <h2>From search to parked in three steps</h2>
          </div>

          <div className="home-steps-grid">
            <article>
              <span>01</span>
              <h3>Search your area</h3>
              <p>
                Choose a neighborhood or ZIP, arrival, departure, and vehicle.
              </p>
            </article>

            <article>
              <span>02</span>
              <h3>Check the fit</h3>
              <p>
                Compare the host’s space guidance with the vehicle you’re
                parking.
              </p>
            </article>

            <article>
              <span>03</span>
              <h3>Reserve confidently</h3>
              <p>
                See the total first, then get the exact address and parking
                instructions.
              </p>
            </article>
          </div>

          <div className="home-host-callout">
            <div>
              <p>Have an empty driveway?</p>
              <h2>Make your space useful.</h2>
              <span>
                Create a clear listing, set your hours, and see every
                reservation from one dashboard.
              </span>
            </div>

            <Link to="/host">List your spot</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
