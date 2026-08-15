
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { createReservation } from "../api/reservations";

function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState("processing");
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setErrorMessage("Missing payment session — please try booking again.");
      return;
    }

    const pendingBookingRaw = sessionStorage.getItem("pendingBooking");

    if (!pendingBookingRaw) {
      setStatus("error");
      setErrorMessage("We couldn't find your booking details. Please try again.");
      return;
    }

    const pendingBooking = JSON.parse(pendingBookingRaw);

    async function finalizeBooking() {
      try {
        await createReservation(pendingBooking);
        sessionStorage.removeItem("pendingBooking");
        window.location.href = "/driver?booked=1"; // matches spec's expected destination
      } catch (error) {
        setStatus("error");
        setErrorMessage(error.message || "Payment succeeded, but we couldn't finalize your booking.");
      }
    }

    finalizeBooking();
  }, [sessionId]);

  if (status === "error") {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <h1 className="text-2xl font-semibold text-red-600 mb-2">Something went wrong</h1>
        <p className="text-gray-600 mb-6">{errorMessage}</p>
        <Link to="/" className="text-blue-600 underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 text-center">
      <p className="text-lg">Finalizing your reservation...</p>
    </div>
  );
}

export default BookingSuccess;