import { formatDateTime, formatPrice, vehicleLabel } from "../utils/formats";

function ReservationCard({ reservation, onCancel, cancelling = false }) {
  const {
    startTime,
    endTime,
    totalPriceCents,
    status,
    driverVehicleCategory,
    listing,
  } = reservation;

  const isConfirmed = status === "CONFIRMED";

  return (
    <article className="search-listing-card driver-reservation-card">
      <div className="search-listing-image driver-reservation-image">
        {listing?.imageUrl ? (
          <img src={listing.imageUrl} alt={listing.title} />
        ) : (
          <span className="search-listing-image-empty">Image unavailable</span>
        )}

        <strong
          className={`search-listing-fit driver-reservation-status ${
            isConfirmed
              ? "search-listing-fit-confirmed"
              : "search-listing-fit-warning"
          }`}
        >
          {isConfirmed ? "✓ CONFIRMED" : "! CANCELLED"}
        </strong>
      </div>

      <div className="search-listing-content driver-reservation-content">
        <p className="search-listing-location">
          <svg
            className="search-listing-location-icon"
            viewBox="0 0 24 24"
          >
            <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
          </svg>
          <span>
            {listing?.neighborhood} · {listing?.zipCode}
          </span>
        </p>
        <h2>{listing?.title}</h2>
        <p className="driver-reservation-address">
          {listing?.streetAddress}, {listing?.city}, {listing?.state}
        </p>

        <div className="driver-reservation-details">
          <p>
            <span>Arrival</span>
            <strong>{formatDateTime(startTime)}</strong>
          </p>
          <p>
            <span>Departure</span>
            <strong>{formatDateTime(endTime)}</strong>
          </p>
          <p>
            <span>Vehicle</span>
            <strong>{vehicleLabel(driverVehicleCategory)}</strong>
          </p>
          <p>
            <span>Total</span>
            <strong>{formatPrice(totalPriceCents)}</strong>
          </p>
        </div>

        {listing?.instructions && isConfirmed && (
          <p className="driver-reservation-instructions">
            <span>Parking instructions</span>
            {listing.instructions}
          </p>
        )}

        {onCancel && isConfirmed && (
          <button
            type="button"
            className="driver-reservation-cancel"
            onClick={() => onCancel(reservation)}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling..." : "Cancel reservation"}
          </button>
        )}
      </div>
    </article>
  );
}

export default ReservationCard;
