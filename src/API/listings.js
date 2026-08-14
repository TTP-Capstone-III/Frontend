// src/api/listings.js
import apiRequest from "./client";

// GET all active listings (public)
export async function getListings() {
  return apiRequest("/api/listings");
}

// GET a single listing by id (public)
export async function getListingById(id) {
  return apiRequest(`/api/listings/${id}`);
}

// POST create a new listing (host only)
export async function createListing(data) {
  return apiRequest("/api/listings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// PUT update a listing (owning host only)
export async function updateListing(id, data) {
  return apiRequest(`/api/listings/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// DELETE (deactivate) a listing (owning host only)
export async function deleteListing(id) {
  return apiRequest(`/api/listings/${id}`, {
    method: "DELETE",
  });
}