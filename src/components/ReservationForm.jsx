import { useState, useEffect } from "react";
import VehicleSelect from "./VehicleSelect";
import { quoteReservation } from "../api/reservations";
import { createCheckoutSession } from "../api/payment";
import { formatPrice } from "../utils/formats";

function toDateTimeInputValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function ReservationForm({ listing, initialValues = {} }) {
  const [startTime, setStartTime] = useState(() =>
    toDateTimeInputValue(initialValues.startTime),
  );
  const [endTime, setEndTime] = useState(() =>
    toDateTimeInputValue(initialValues.endTime),
  );
  const [driverVehicleCategory, setDriverVehicleCategory] = useState(
    initialValues.driverVehicleCategory ?? "",
  );
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

      await createCheckoutSession(bookingDetails);
    } catch (err) {
      setError(err.message || "Unable to start checkout. Please try again.");
      setRedirecting(false);
    }
  }

  return (
    <form onSubmit={handleGetQuote} className="reservation-form">
      <div className="reservation-dates">
        <div className="reservation-field">
          <label htmlFor="startTime">Arrival</label>
          <input
            id="startTime"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>

        <div className="reservation-field">
          <label htmlFor="endTime">Departure</label>
          <input
            id="endTime"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
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

      {error ? (
        <p className="app-alert reservation-error" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={quoting || redirecting} className="btn-amber">
        {quoting ? "Checking..." : "Check price & availability"}
      </button>

      {quote && (
        <div className="reservation-quote">
          <div className="reservation-quote-total">
            <span>Estimated total</span>
            <strong>{formatPrice(quote.totalPriceCents)}</strong>
          </div>
          {quote.billableBlocks && (
            <p className="reservation-quote-detail">
              {quote.billableBlocks} billable 30-minute blocks
            </p>
          )}
          <p className="reservation-quote-detail">{quote.fitMessage}</p>
          <button
            type="button"
            onClick={handleConfirmAndPay}
            disabled={redirecting}
            className="btn-amber reservation-checkout-button"
          >
            {redirecting ? "Redirecting to payment..." : "Confirm & Pay"}
          </button>
        </div>
      )}
    </form>
  );
}

export default ReservationForm;
