// src/components/DriverReservations.jsx
import { useEffect, useState } from "react";
import { getDriverReservations, cancelReservation } from "../api/reservations";
import ReservationCard from "./ReservationCard";

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
      const data = await getDriverReservations();
      setReservations(data);
    } catch (err) {
      setError(err.message);
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
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) return <p>Loading your reservations...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (reservations.length === 0) return <p>You have no reservations yet.</p>;

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <ReservationCard
          key={reservation.id}
          reservation={reservation}
          onCancel={cancellingId === reservation.id ? undefined : handleCancel}
        />
      ))}
    </div>
  );
}

export default DriverReservations;