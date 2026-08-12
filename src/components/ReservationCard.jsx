// src/components/ReservationCard.jsx
function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function ReservationCard({ reservation, onCancel, showDriver = false }) {
  const { id, startTime, endTime, totalPriceCents, status, listing, driver } = reservation;

  const isCancellable = status === "CONFIRMED" && new Date(startTime) > new Date();

  return (
    <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{listing?.title}</h3>
          <p className="text-sm text-gray-600">
            {listing?.streetAddress}, {listing?.neighborhood}
          </p>
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            status === "CONFIRMED"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="mt-3 text-sm text-gray-700 space-y-1">
        <p>
          <span className="font-medium">Start:</span> {formatDateTime(startTime)}
        </p>
        <p>
          <span className="font-medium">End:</span> {formatDateTime(endTime)}
        </p>
        <p>
          <span className="font-medium">Total:</span> {formatPrice(totalPriceCents)}
        </p>
        {showDriver && driver && (
          <p>
            <span className="font-medium">Driver:</span> {driver.name}
          </p>
        )}
      </div>

      {onCancel && isCancellable && (
        <button
          onClick={() => onCancel(id)}
          className="mt-3 text-sm text-red-600 hover:underline"
        >
          Cancel reservation
        </button>
      )}
    </div>
  );
}

export default ReservationCard;