
import apiRequest from "./client";

export async function quoteReservation(data) {
  return apiRequest("/api/reservations/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function createReservation(data) {
  return apiRequest("/api/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function getDriverReservations() {
  return apiRequest("/api/reservations/driver");
}

export async function cancelReservation(id) {
  return apiRequest(`/api/reservations/${id}/cancel`, {
    method: "PATCH",
  });
}

export async function getHostReservations() {
  return apiRequest("/api/host/reservations");
}

export async function getHostListings() {
  return apiRequest("/api/host/listings");
}