
import apiRequest from "./client";

export async function createCheckoutSession({ listingId, startTime, endTime, totalPriceCents }) {
  const { url } = await apiRequest("/api/payments/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingId, startTime, endTime, totalPriceCents }),
  });

  window.location.href = url;
}