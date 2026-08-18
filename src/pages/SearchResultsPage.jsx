import { Link, useSearchParams } from "react-router-dom"; //hook that reads the section after ?.
import { useEffect, useState } from "react";
import apiRequest from "../api/client"; //uses shared backend URL, cookies, JSON parsing, and error handling.
import SearchMap from "../components/SearchMap";
import ParkingSearchForm, {
  getVehicleLabel,
} from "../components/ParkingSearchForm";
import "../styles/pages/search-results-page.css";

function createInitialBounds(latitude, longitude) {
  return {
    west: longitude - 0.06,
    south: latitude - 0.045,
    east: longitude + 0.06,
    north: latitude + 0.045,
  };
}

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [listings, setListings] = useState([]);
  const [hoveredListingId, setHoveredListingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState("");

  const location = searchParams.get("location") ?? "";
  const startTime = searchParams.get("startTime") ?? "";
  const endTime = searchParams.get("endTime") ?? "";
  const driverVehicleCategory = searchParams.get("driverVehicleCategory") ?? "";

  const latitudeValue = searchParams.get("destinationLat");
  const longitudeValue = searchParams.get("destinationLng");

  const destinationLat =
    latitudeValue === null ? Number.NaN : Number(latitudeValue);

  const destinationLng =
    longitudeValue === null ? Number.NaN : Number(longitudeValue);
  //     did not immediately write Number(searchParams.get(...)). Because: Number(null) produces 0. That would incorrectly treat a missing coordinate as a real coordinate.

  const [mapBounds, setMapBounds] = useState(() =>
    // - mapBounds contains the current boundaries - setMapBounds() will replace them after the user moves the map.
    createInitialBounds(destinationLat, destinationLng),
  );

  const sort = searchParams.get("sort") === "price" ? "price" : "distance";

  function handleSortChange(event) {
    const nextSearchParams = new URLSearchParams(searchParams);

    nextSearchParams.set("sort", event.target.value);

    setSearchParams(nextSearchParams);
  }

  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  //to check whether the URL contains usable dates.

  const hasValidSearch =
    location.trim() !== "" &&
    Number.isFinite(destinationLat) &&
    Number.isFinite(destinationLng) &&
    destinationLat >= -90 &&
    destinationLat <= 90 &&
    destinationLng >= -180 &&
    destinationLng <= 180 &&
    !Number.isNaN(startDate.getTime()) &&
    !Number.isNaN(endDate.getTime()) &&
    endDate > startDate &&
    driverVehicleCategory !== "";

  const searchFormInitialValues = {
    location,
    destinationLat,
    destinationLng,
    startTime,
    endTime,
    driverVehicleCategory,
  };

  const resultLabel = `${listings.length} parking ${listings.length === 1 ? "spot" : "spots"} available`;

  const vehicleLabel = getVehicleLabel(driverVehicleCategory);

  let resultsHeading = resultLabel;

  if (loading) {
    resultsHeading = "Finding available parking spots...";
  } else if (requestError) {
    resultsHeading = "Search results unavailable";
  }

  useEffect(() => {
    if (!hasValidSearch) {
      setListings([]);
      setLoading(false);
      return;
    }

    const abortController = new AbortController();

    async function loadListings() {
      setLoading(true);
      setRequestError("");

      const query = new URLSearchParams({
        location: location.trim(),
        startTime,
        endTime,
        driverVehicleCategory,
        destinationLat: String(destinationLat),
        destinationLng: String(destinationLng),
        west: String(mapBounds.west),
        south: String(mapBounds.south),
        east: String(mapBounds.east),
        north: String(mapBounds.north),
        sort,
      });

      try {
        const response = await apiRequest(`/api/listings?${query}`, {
          signal: abortController.signal,
        });

        setListings(response.items);
      } catch (error) {
        if (error.name !== "AbortError") {
          setListings([]);
          setRequestError(error.message);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadListings();

    return () => {
      abortController.abort();
    };
  }, [
    //  Dependencies array: Run the listing request again when one of these search values changes
    hasValidSearch,
    location,
    startTime,
    endTime,
    driverVehicleCategory,
    destinationLat,
    destinationLng,
    mapBounds,
    sort,
  ]);

  if (!hasValidSearch) {
    return (
      <main className="search-results-page">
        <h1>Start a parking search</h1>
        <p>
          Choose a location, reservation time, and vehicle from the homepage.
        </p>
      </main>
    );
  }
  return (
    <>
      <section className="search-results-toolbar">
        <ParkingSearchForm
          key={searchParams.toString()}
          initialValues={searchFormInitialValues}
          compact
        />
      </section>
      <main className="search-results-layout">
        <section className="search-results-panel">
          <div className="search-results-heading">
            <div>
              <p className="search-results-eyebrow">Near your destination</p>
              <h1>{resultsHeading}</h1>

              <span className="search-results-vehicle">
                Vehicle: {vehicleLabel}
              </span>
            </div>

            <div className="search-results-controls">
              <label className="search-results-sort">
                <span>Sort by</span>

                <select value={sort} onChange={handleSortChange}>
                  <option value="distance">Distance: Nearest first</option>
                  <option value="price">Price: Low to High</option>
                </select>
              </label>
            </div>
          </div>

          {!loading && requestError ? ( //The request finished AND an error message exists
            <p className="app-alert" role="alert">
              {requestError}
            </p>
          ) : null}

          {!loading && !requestError && listings.length === 0 ? (
            <p>No parking spots were found in this area.</p>
          ) : null}

          {!loading && !requestError && listings.length > 0 ? (
            <div className="search-listing-grid">
              {listings.map((listing) => (
                <Link
                  to={`/listings/${listing.id}`}
                  className="search-listing-card"
                  key={listing.id}
                  onMouseEnter={() => setHoveredListingId(listing.id)}
                  onMouseLeave={() => setHoveredListingId(null)}
                >
                  <div className="search-listing-image">
                    {listing.imageUrl ? (
                      <img src={listing.imageUrl} alt={listing.title} />
                    ) : (
                      <span className="search-listing-image-empty">
                        Image unavailable
                      </span>
                    )}

                    {listing.fitStatus ? (
                      <span
                        className={`search-listing-fit${
                          listing.fitStatus === "ACK_REQUIRED"
                            ? " search-listing-fit-warning"
                            : " search-listing-fit-confirmed"
                        }`}
                      >
                        {listing.fitStatus === "ACK_REQUIRED"
                          ? "! REVIEW FIT NOTES"
                          : "✓ YOUR VEHICLE FITS"}
                      </span>
                    ) : null}
                  </div>

                  <div className="search-listing-content">
                    <p className="search-listing-location">
                      <svg
                        className="search-listing-location-icon"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
                      </svg>
                      <span>
                        {listing.neighborhood} · {listing.zipCode}
                      </span>
                    </p>
                    <h2>{listing.title}</h2>

                    <p className="search-listing-fit-summary">
                      Up to{" "}
                      {getVehicleLabel(
                        listing.maxVehicleCategory,
                      ).toLowerCase()}
                    </p>

                    {Number.isFinite(listing.distanceMiles) ? (
                      <p className="search-listing-distance">
                        {listing.distanceMiles} mi from destination
                      </p>
                    ) : null}

                    <p className="search-listing-price">
                      <strong>
                        ${(listing.hourlyPriceCents / 100).toFixed(2)}
                      </strong>
                      <span> / hour</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </section>

        <aside className="search-map-panel">
          <SearchMap
            latitude={destinationLat}
            longitude={destinationLng}
            listings={listings}
            hoveredListingId={hoveredListingId}
            onBoundsChange={setMapBounds}
          />{" "}
          {/* send listings to show them on the map with markers */}
        </aside>
      </main>
    </>
  );
}
