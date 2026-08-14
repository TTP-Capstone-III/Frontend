// src/components/HostReservations.jsx
import { useEffect, useState } from "react";
import { getHostReservations } from "../API/reservations";
import ReservationCard from "./ReservationCard";

function HostReservations() {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReservations() {
      try {
        const data = await getHostReservations();
        setReservations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadReservations();
  }, []);

  if (loading) return <p>Loading reservations...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (reservations.length === 0) return <p>No reservations yet.</p>;

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <ReservationCard key={reservation.id} reservation={reservation} showDriver />
      ))}
    </div>
  );
}

export default HostReservations;