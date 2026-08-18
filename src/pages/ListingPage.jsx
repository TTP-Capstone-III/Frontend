import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getListingById } from "../api/listings";
import { getVehicleLabel } from "../components/ParkingSearchForm";
import ReservationForm from "../components/ReservationForm";
import { useAuth } from "../context/AuthContext";
import { formatDateTime, formatPrice } from "../utils/formats";
import "../styles/pages/listing-page.css";

export default function ListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    const abortController = new AbortController();

    async function loadListing() {
      setLoading(true);
      setRequestError("");

      try {
        const result = await getListingById(id);
        setListing(result);
      } catch (error) {
        setListing(null);
        setRequestError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadListing();

    return () => {
      abortController.abort();
    };
  }, [id]);

  if (loading) {
    return (
      <main className="listing-detail-page">
        <p className="listing-detail-message">Loading listing...</p>
      </main>
    );
  }

  if (requestError || !listing) {
    return (
      <main className="listing-detail-page">
        <p className="app-alert" role="alert">
          {requestError || "Listing not found."}
        </p>
      </main>
    );
  }

  const reservationInitialValues = {
    startTime: searchParams.get("startTime") ?? "",
    endTime: searchParams.get("endTime") ?? "",
    driverVehicleCategory:
      searchParams.get("driverVehicleCategory") ?? "",
  };

  return (
    <main className="listing-detail-page">
      <button
        type="button"
        className="listing-detail-back-link"
        onClick={() => navigate(-1)}
      >
        ← Back to results
      </button>

      <header className="listing-detail-header">
        <div className="listing-detail-title-copy">
          <p className="listing-detail-eyebrow">
            <svg
              className="listing-detail-location-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
            </svg>
            <span>
              {listing.neighborhood} · {listing.city}, {listing.state} ·{" "}
              {listing.zipCode}
            </span>
          </p>
          <h1>{listing.title}</h1>
          {listing.host ? (
            <p className="listing-detail-host">Hosted by {listing.host.name}</p>
          ) : null}
        </div>
      </header>

      <div className="listing-detail-layout">
        <section className="listing-detail-main">
          <div className="listing-detail-image">
            {listing.imageUrl ? (
              <img src={listing.imageUrl} alt={listing.title} />
            ) : (
              <span className="listing-detail-image-empty">
                Image unavailable
              </span>
            )}
          </div>

          <div className="listing-detail-highlights">
            <article className="listing-detail-highlight">
              <span className="listing-detail-highlight-icon">✓</span>
              <div>
                <h2>Vehicle capacity</h2>
                <p>
                  Up to {getVehicleLabel(listing.maxVehicleCategory)}
                </p>
              </div>
            </article>

            <article className="listing-detail-highlight">
              <svg
                className="listing-detail-highlight-svg"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
              </svg>
              <div>
                <h2>Location protected</h2>
                <p>Exact details are shared after booking.</p>
              </div>
            </article>
          </div>

          <div className="listing-detail-section">
            <h2>About this space</h2>
            <p>{listing.description}</p>
          </div>

          {listing.otherVehicleDescription ? (
            <div className="listing-detail-section">
              <h2>Vehicle fit notes</h2>
              <p>{listing.otherVehicleDescription}</p>
            </div>
          ) : null}

          <div className="listing-detail-section">
            <h2>Available booking window</h2>
            <div className="listing-detail-availability">
              <div>
                <span>From</span>
                <strong>{formatDateTime(listing.availableFrom)}</strong>
              </div>
              <div>
                <span>Until</span>
                <strong>{formatDateTime(listing.availableUntil)}</strong>
              </div>
            </div>
          </div>
        </section>

        <aside className="listing-detail-reserve">
          <div className="listing-detail-reserve-heading">
            <div className="listing-detail-price">
              <strong>{formatPrice(listing.hourlyPriceCents)}</strong>
              <span>/ hour</span>
            </div>
            <p>Check availability before payment.</p>
          </div>

          {user ? (
            <ReservationForm
              listing={listing}
              initialValues={reservationInitialValues}
            />
          ) : (
            <>
              <button
                type="button"
                className="btn-amber listing-detail-login-button"
                onClick={() => navigate("/auth")}
              >
                Log in to reserve
              </button>
              <p className="listing-detail-reserve-note">
                Log in to check availability and continue to secure checkout.
              </p>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
