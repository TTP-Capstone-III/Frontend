import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getListingById } from "../api/listings";
import { getVehicleLabel } from "../components/ParkingSearchForm";
import ReservationForm from "../components/ReservationForm";
import { useAuth } from "../context/AuthContext";
import { formatDateTime, formatPrice } from "../utils/formats";
import "../styles/pages/listing-page.css";

export default function ListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  return (
    <main className="listing-detail-page">
      <button
        type="button"
        className="listing-detail-back-link"
        onClick={() => navigate(-1)}
      >
        ← Back to results
      </button>

      <p className="listing-detail-eyebrow">
        <svg
          className="listing-detail-location-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
        </svg>
        <span>
          {listing.neighborhood} · {listing.zipCode}
        </span>
      </p>

      <div className="listing-detail-title-row">
        <div>
          <h1>{listing.title}</h1>
          {listing.host ? (
            <p className="listing-detail-host">Hosted by {listing.host.name}</p>
          ) : null}
        </div>

        <div className="listing-detail-price">
          <strong>{formatPrice(listing.hourlyPriceCents)}</strong>
          <span>per hour</span>
        </div>
      </div>

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

          <div className="listing-detail-section">
            <h2>About this space</h2>
            <p>{listing.description}</p>
          </div>

          <div className="listing-detail-section">
            <h2>Vehicle fit</h2>
            <p>
              Largest standard fit:{" "}
              <strong>{getVehicleLabel(listing.maxVehicleCategory)}</strong>
            </p>
            {listing.otherVehicleDescription ? (
              <p className="listing-detail-section-note">
                {listing.otherVehicleDescription}
              </p>
            ) : null}
          </div>

          <div className="listing-detail-section">
            <h2>Location</h2>
            <p>
              {listing.neighborhood}, {listing.city}, {listing.state}{" "}
              {listing.zipCode}
            </p>
            <p className="listing-detail-section-note">
              The exact street address and instructions appear after booking.
            </p>
          </div>

          <div className="listing-detail-section">
            <h2>Host availability</h2>
            <p>
              {formatDateTime(listing.availableFrom)} →{" "}
              {formatDateTime(listing.availableUntil)}
            </p>
          </div>
        </section>

        <aside className="listing-detail-reserve">
          <h2>Reserve this spot</h2>

          {user ? (
            <ReservationForm listing={listing} />
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
                No payment is collected in this step.
              </p>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
