import "../css/DriverDashBoard.css";
import { formatPrice, formatDateTime } from "../utils/formats";

function ReservationCard({ reservation, onCancel, showDriver = false }) {
  const { id, startTime, endTime, totalPriceCents, status, listing, driver } = reservation;

  const isCancellable = status === "CONFIRMED" && new Date(startTime) > new Date();
  const statusClass = status === "CONFIRMED" ? "confirmed" : "cancelled";

  return (
    <div className="reservation-card">
      <p className="reservation-card-title">{listing?.title}</p>
      <p className="reservation-card-address">
        {listing?.streetAddress}, {listing?.neighborhood}
      </p>

      <span className={`reservation-card-status ${statusClass}`}>{status}</span>

      <p className="reservation-card-detail">
        <strong>Start:</strong> {formatDateTime(startTime)}
      </p>
      <p className="reservation-card-detail">
        <strong>End:</strong> {formatDateTime(endTime)}
      </p>
      <p className="reservation-card-detail">
        <strong>Total:</strong> {formatPrice(totalPriceCents)}
      </p>
      {showDriver && driver && (
        <p className="reservation-card-detail">
          <strong>Driver:</strong> {driver.name}
        </p>
      )}

      {onCancel && isCancellable && (
        <button onClick={() => onCancel(id)} className="btn-cancel">
          Cancel reservation
        </button>
      )}
    </div>
  );
}

export default ReservationCard;