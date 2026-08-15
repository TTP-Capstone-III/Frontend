import { useState, useEffect } from "react";
import VehicleSelect from "./VehicleSelect";
import { quoteReservation } from "../api/reservations";
import { createCheckoutSession } from "../api/payment";
import { formatPrice } from "../utils/formats";
import "../css/DriverDashBoard.css";

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

      sessionStorage.setItem("pendingBooking", JSON.stringify(bookingDetails));

      await createCheckoutSession({
        listingId: listing.id,
        startTime: bookingDetails.startTime,
        endTime: bookingDetails.endTime,
        totalPriceCents: quote.totalPriceCents,
      });
    } catch (err) {
      setError(err.message || "Unable to start checkout. Please try again.");
      setRedirecting(false);
    }
  }

  return (
    <form onSubmit={handleGetQuote} className="reservation-form">
      <div className="form-field">
        <label htmlFor="startTime">Arrival</label>
        <input
          id="startTime"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="endTime">Departure</label>
        <input
          id="endTime"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </div>

      <VehicleSelect value={driverVehicleCategory} onChange={handleVehicleChange} />

      {needsAcknowledgment && (
        <label className="fit-acknowledgment">
          <input
            type="checkbox"
            checked={fitAcknowledged}
            onChange={(e) => setFitAcknowledged(e.target.checked)}
          />
          <span>
            {listing?.otherVehicleDescription ||
              "This listing's vehicle fit can't be confirmed automatically. I acknowledge my vehicle may not fit."}
          </span>
        </label>
      )}

      {error && <p className="form-error">{error}</p>}

      <button type="submit" disabled={quoting || redirecting} className="btn-amber">
        {quoting ? "Checking..." : "Check price & availability"}
      </button>

      {quote && (
        <div className="quote-box">
          <p className="quote-price">{formatPrice(quote.totalPriceCents)}</p>
          {quote.billableBlocks && (
            <p className="quote-detail">Billed time: {quote.billableBlocks}</p>
          )}
          <p className="quote-detail">{quote.fitMessage}</p>
          <button
            type="button"
            onClick={handleConfirmAndPay}
            disabled={redirecting}
            className="btn-amber"
            style={{ marginTop: "0.75rem" }}
          >
            {redirecting ? "Redirecting to payment..." : "Confirm & Pay"}
          </button>
        </div>
      )}
    </form>
  );
}

export default ReservationForm;