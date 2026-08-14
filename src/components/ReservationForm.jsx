
import { useState, useEffect } from "react";
import VehicleSelect from "./VehicleSelect";
import { quoteReservation } from "../api/reservations";
import { createCheckoutSession } from "../api/payments";
import { formatPrice } from "../utils/format";

function ReservationForm({ listing }) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [driverVehicleCategory, setDriverVehicleCategory] = useState("");
  const [fitAcknowledged, setFitAcknowledged] = useState(false);

  const [quote, setQuote] = useState(null);
  const [error, setError] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const needsAcknowledgment =
    listing?.maxVehicleCategory === "OTHER_NOT_SURE" ||
    driverVehicleCategory === "OTHER_NOT_SURE";

  useEffect(() => {
    setQuote(null);
  }, [startTime, endTime, driverVehicleCategory, fitAcknowledged]);

  function handleVehicleChange(value) {
    setDriverVehicleCategory(value);
    setFitAcknowledged(false);
  }

  async function handleGetQuote(e) {
    e.preventDefault();
    setError(null);

    if (needsAcknowledgment && !fitAcknowledged) {
      setError("Please acknowledge the vehicle fit before requesting a quote.");
      return;
    }

    try {
      setQuoting(true);
      const result = await quoteReservation({
        listingId: listing.id,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        driverVehicleCategory,
        fitAcknowledged,
      });
      setQuote(result);
    } catch (err) {
      setError(err.message || "Unable to get a quote for this booking.");
    } finally {
      setQuoting(false);
    }
  }

  async function handleConfirmAndPay() {
    setError(null);
    try {
      setRedirecting(true);

      const bookingDetails = {
        listingId: listing.id,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        driverVehicleCategory,
        fitAcknowledged,
      };

      // stashed so BookingSuccess can call createReservation() after payment
      sessionStorage.setItem("pendingBooking", JSON.stringify(bookingDetails));

      await createCheckoutSession({
        listingId: listing.id,
        startTime: bookingDetails.startTime,
        endTime: bookingDetails.endTime,
        totalPriceCents: quote.totalPriceCents,
      });
      // browser redirects to Stripe from here — no further code runs
    } catch (err) {
      setError(err.message || "Unable to start checkout. Please try again.");
      setRedirecting(false);
    }
  }

  return (
    <form onSubmit={handleGetQuote} className="space-y-4 max-w-md">
      <div>
        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
          Arrival
        </label>
        <input
          id="startTime"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
          Departure
        </label>
        <input
          id="endTime"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      <VehicleSelect value={driverVehicleCategory} onChange={handleVehicleChange} />

      {needsAcknowledgment && (
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={fitAcknowledged}
            onChange={(e) => setFitAcknowledged(e.target.checked)}
            className="mt-1"
          />
          <span>
            {listing?.otherVehicleDescription ||
              "This listing's vehicle fit can't be confirmed automatically. I acknowledge my vehicle may not fit."}
          </span>
        </label>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={quoting || redirecting}
        className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {quoting ? "Checking..." : "Check price & availability"}
      </button>

      {quote && (
        <div className="border border-gray-200 rounded-md p-4 mt-4 space-y-2">
          <p className="text-lg font-semibold">{formatPrice(quote.totalPriceCents)}</p>
          {quote.billableBlocks && (
            <p className="text-sm text-gray-600">Billed time: {quote.billableBlocks}</p>
          )}
          <p className="text-sm text-gray-600">{quote.fitMessage}</p>
          <button
            type="button"
            onClick={handleConfirmAndPay}
            disabled={redirecting}
            className="w-full bg-green-600 text-white rounded-md py-2 font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {redirecting ? "Redirecting to payment..." : "Confirm & Pay"}
          </button>
        </div>
      )}
    </form>
  );
}

export default ReservationForm;