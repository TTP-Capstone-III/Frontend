// src/components/DriverReservation.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDriverReservations, cancelReservation } from "../api/reservations";
import ReservationCard from "./ReservationCard";
import "../css/DriverDashboard.css";

function DriverReservations() {
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

  async function handleCancel(id) {
    setError(null);
    try {
      setCancellingId(id);
      const updated = await cancelReservation(id);
      setReservations((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
    } catch (err) {
      setError(err.message || "Unable to cancel this reservation.");
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) {
    return <p className="page-subtitle">Loading your reservations...</p>;
  }

  const now = new Date();

  // "Upcoming" = still confirmed and hasn't started yet.
  const upcoming = reservations
    .filter((r) => r.status === "CONFIRMED" && new Date(r.startTime) > now)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  // Everything else (cancelled, or confirmed trips already in progress/finished).
  const past = reservations
    .filter((r) => !(r.status === "CONFIRMED" && new Date(r.startTime) > now))
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  const totalSpentCents = reservations
    .filter((r) => r.status !== "CANCELLED")
    .reduce((sum, r) => sum + (r.totalPriceCents || 0), 0);

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-number">{upcoming.length}</p>
          <p className="stat-label">Upcoming trips</p>
        </div>
        <div className="stat-card">
          <p className="stat-number">{reservations.length}</p>
          <p className="stat-label">Total reservations</p>
        </div>
        <div className="stat-card">
          <p className="stat-number">${(totalSpentCents / 100).toFixed(2)}</p>
          <p className="stat-label">Total spent</p>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="section">
        <h2 className="section-title">Upcoming trips</h2>
        {upcoming.length === 0 ? (
          <div className="empty-state">
            <p>You don't have any upcoming reservations yet.</p>
            <Link to="/">Find parking</Link>
          </div>
        ) : (
          upcoming.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onCancel={cancellingId === reservation.id ? undefined : handleCancel}
            />
          ))
        )}
      </div>

      <div className="section">
        <h2 className="section-title">Past &amp; cancelled trips</h2>
        {past.length === 0 ? (
          <p className="page-subtitle">Trips you've completed or cancelled will show up here.</p>
        ) : (
          past.map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))
        )}
      </div>
    </div>
  );
}

export default DriverReservations;
