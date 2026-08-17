import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { cancelReservation, getDriverReservations } from "../api/reservations";
import ReservationCard from "./ReservationCard";

function DriverReservations() {
  const [searchParams] = useSearchParams();
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    loadReservations();
  }, []);

  async function loadReservations() {
    try {
      setLoading(true);
      setError(null);
      const data = await getDriverReservations();
      setReservations(data);
    } catch (err) {
      setError(err.message || "Unable to load your reservations.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(reservation) {
    const confirmed = window.confirm(
      `Cancel your reservation at "${reservation.listing?.title}"?`,
    );

    if (!confirmed) return;

    try {
      setError(null);
      setCancellingId(reservation.id);
      const updatedReservation = await cancelReservation(reservation.id);

      setReservations((currentReservations) =>
        currentReservations.map((currentReservation) =>
          currentReservation.id === updatedReservation.id
            ? { ...currentReservation, ...updatedReservation }
            : currentReservation,
        ),
      );
    } catch (err) {
      setError(err.message || "Unable to cancel this reservation.");
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) {
    return (
      <p className="driver-dashboard-message">Loading your reservations...</p>
    );
  }

  const now = new Date();
  const upcomingReservations = reservations.filter(
    (reservation) =>
      reservation.status === "CONFIRMED" &&
      new Date(reservation.startTime) > now,
  );
  const completedReservations = reservations.filter(
    (reservation) =>
      reservation.status === "CONFIRMED" &&
      new Date(reservation.startTime) <= now,
  );
  const cancelledReservations = reservations.filter(
    (reservation) => reservation.status === "CANCELLED",
  );
  const reservationHistory = [
    ...completedReservations,
    ...cancelledReservations,
  ].sort(
    (first, second) => new Date(second.startTime) - new Date(first.startTime),
  );

  return (
    <>
      {searchParams.get("booked") === "1" && (
        <p className="driver-dashboard-success">
          Your parking reservation is confirmed.
        </p>
      )}

      {error && <p className="driver-dashboard-error">{error}</p>}

      <section className="stats-grid">
        <article className="stat-card">
          <p className="stat-number">{upcomingReservations.length}</p>
          <p className="stat-label">Upcoming reservations</p>
        </article>
        <article className="stat-card">
          <p className="stat-number">{completedReservations.length}</p>
          <p className="stat-label">Completed reservations</p>
        </article>
        <article className="stat-card">
          <p className="stat-number">{cancelledReservations.length}</p>
          <p className="stat-label">Cancelled reservations</p>
        </article>
      </section>

      <section className="section driver-dashboard-section">
        <p className="driver-dashboard-section-eyebrow">Next stops</p>
        <h2 className="section-title">Upcoming reservations</h2>

        {upcomingReservations.length === 0 ? (
          <div className="driver-dashboard-empty">
            <h3>No upcoming reservations</h3>
            <p>Your next confirmed parking reservation will appear here.</p>
          </div>
        ) : (
          <div className="driver-reservation-grid">
            {upcomingReservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onCancel={handleCancel}
                cancelling={cancellingId === reservation.id}
              />
            ))}
          </div>
        )}
      </section>

      <section className="section driver-dashboard-section">
        <p className="driver-dashboard-section-eyebrow">Previous activity</p>
        <h2 className="section-title">Reservation history</h2>

        {reservationHistory.length === 0 ? (
          <div className="driver-dashboard-empty">
            <h3>No reservation history yet</h3>
            <p>Completed and cancelled reservations will appear here.</p>
          </div>
        ) : (
          <div className="driver-reservation-grid">
            {reservationHistory.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default DriverReservations;
