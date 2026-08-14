import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../api/client";
import LocationSearchInput from "../components/LocationSearchInput";
import "../styles/pages/home-page.css";

// Broad boundaries allow the default homepage to choose from seeded listings.
const HOMEPAGE_DISCOVERY_AREA = {
  destinationLat: 39.8283,
  destinationLng: -98.5795,
  west: -180,
  south: 18,
  east: -66,
  north: 72,
};

const HOMEPAGE_RADIUS_MILES = 5;
const MILES_PER_LATITUDE_DEGREE = 69;

function createNearbyBounds(latitude, longitude) {
  // Convert the five-mile radius into map boundaries for the backend search.
  const latitudeDifference = HOMEPAGE_RADIUS_MILES / MILES_PER_LATITUDE_DEGREE;

  const latitudeInRadians = (latitude * Math.PI) / 180;

  const longitudeDifference =
    HOMEPAGE_RADIUS_MILES /
    (MILES_PER_LATITUDE_DEGREE * Math.cos(latitudeInRadians));

  return {
    west: longitude - longitudeDifference,
    south: latitude - latitudeDifference,
    east: longitude + longitudeDifference,
    north: latitude + latitudeDifference,
  };
}

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

const DEFAULT_FORM = {
  location: "",
  destinationLat: "",
  destinationLng: "",
  startTime: DEFAULT_TIMES.startTime,
  endTime: DEFAULT_TIMES.endTime,
  driverVehicleCategory: "COMPACT",
};

export default function HomePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(DEFAULT_FORM);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [findingLocation, setFindingLocation] = useState(false);

  // This switches the card heading after geolocation loads nearby results.
  const [showingNearbyListings, setShowingNearbyListings] = useState(false);

  function updateForm(field, value) {
    // Computed property syntax updates whichever form field called this helper.
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  //runs while the user types.
  // saves the text but clears coordinates because typed text is not yet a confirmed Mapbox location.
  function handleLocationChange(locationText) {
    setForm((currentForm) => ({
      ...currentForm,
      location: locationText,
      destinationLat: "",
      destinationLng: "",
    }));
  }

  // runs after the user selects a suggestion.
  // It saves: - The readable address, Latitude, Longitude
  function handleLocationSelect(selectedLocation) {
    setForm((currentForm) => ({
      ...currentForm,
      location: selectedLocation.label,
      destinationLat: selectedLocation.latitude,
      destinationLng: selectedLocation.longitude,
    }));
  }

  async function loadRandomHomepageListings() {
    setLoading(true);
    setError("");
    setShowingNearbyListings(false);

    try {
      // The backend expects dates, vehicle size, location, and visible boundaries.
      const query = new URLSearchParams({
        startTime: new Date(DEFAULT_FORM.startTime).toISOString(),
        endTime: new Date(DEFAULT_FORM.endTime).toISOString(),
        driverVehicleCategory: DEFAULT_FORM.driverVehicleCategory,
        destinationLat: HOMEPAGE_DISCOVERY_AREA.destinationLat,
        destinationLng: HOMEPAGE_DISCOVERY_AREA.destinationLng,
        west: HOMEPAGE_DISCOVERY_AREA.west,
        south: HOMEPAGE_DISCOVERY_AREA.south,
        east: HOMEPAGE_DISCOVERY_AREA.east,
        north: HOMEPAGE_DISCOVERY_AREA.north,
        sort: "distance",
      });

      const response = await apiRequest(`/api/listings?${query}`);

      // Shuffle a copied array so the homepage can show a different set of ten.
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

  async function loadNearbyHomepageListings(latitude, longitude) {
    setLoading(true);
    setError("");

    try {
      // Build a smaller search area around the device coordinates.
      const bounds = createNearbyBounds(latitude, longitude);

      const query = new URLSearchParams({
        startTime: new Date(DEFAULT_FORM.startTime).toISOString(),
        endTime: new Date(DEFAULT_FORM.endTime).toISOString(),
        driverVehicleCategory: DEFAULT_FORM.driverVehicleCategory,
        destinationLat: latitude,
        destinationLng: longitude,
        west: bounds.west,
        south: bounds.south,
        east: bounds.east,
        north: bounds.north,
        sort: "distance",
      });

      const response = await apiRequest(`/api/listings?${query}`);

      // Keep only true five-mile matches, randomize them, and show at most ten.
      const nearbyListings = response.items
        .filter((listing) => listing.distanceMiles <= HOMEPAGE_RADIUS_MILES)
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

      setListings(nearbyListings);
      setShowingNearbyListings(true);
    } catch (requestError) {
      setListings([]);
      setShowingNearbyListings(false);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      loadRandomHomepageListings();
      return;
    }

    setFindingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Use the device location only to personalize the homepage cards.
        await loadNearbyHomepageListings(latitude, longitude);

        setFindingLocation(false);
      },
      async () => {
        // Permission failed, so display a new random selection instead.
        await loadRandomHomepageListings();

        setFindingLocation(false);
      },

      {
        // A recent approximate location is accurate enough for homepage cards.
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
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
    // Load a random discovery set once when the homepage first mounts.
    loadRandomHomepageListings();
  }, []);

  return (
    <main className="listing-page">
      <section className="listing-header">
        <p className="listing-eyebrow">Easy parking, made neighborly</p>
        <h1>
          Park closer. <span>Pay less.</span>
        </h1>

        <form className="listing-searchbar" onSubmit={handleSubmit}>
          {/* not<lable></lable> */}
          <div className="listing-search-field listing-location-field">
            <span>Where</span>

            <LocationSearchInput
              value={form.location}
              onChange={handleLocationChange}
              onSelect={handleLocationSelect}
              onUseCurrentLocation={handleUseCurrentLocation}
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
          <p className="listing-message listing-error app-alert" role="alert">
            {error}
          </p>
        ) : null}
      </section>

      <section className="listing-results">
        <div className="listing-results-heading">
          <div>
            <p>
              {showingNearbyListings ? "Available nearby" : "Available spots"}
            </p>
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

