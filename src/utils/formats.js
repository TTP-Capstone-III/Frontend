export function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export const VEHICLE_LABELS = {
  COMPACT: "Compact",
  SEDAN: "Sedan",
  SMALL_SUV: "Small SUV",
  LARGE_SUV_MINIVAN: "Large SUV / Minivan",
  PICKUP: "Pickup Truck",
  OTHER_NOT_SURE: "Other / Not sure",
};

export function vehicleLabel(category) {
  return VEHICLE_LABELS[category] || category;
}