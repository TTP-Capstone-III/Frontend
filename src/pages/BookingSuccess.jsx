
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

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

    // The backend creates the reservation before checkout and confirms it by webhook.
    sessionStorage.removeItem("pendingBooking");
    setStatus("complete");
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

  if (status === "complete") {
    return (
      <main>
        <h1>Payment received</h1>
        <p>Your reservation is being confirmed.</p>
        <Link to="/driver?booked=1">View driver dashboard</Link>
      </main>
    );
  }

  return <p>Confirming your payment...</p>;
}

export default BookingSuccess;
