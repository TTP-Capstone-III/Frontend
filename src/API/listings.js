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

// PATCH update a listing (owning host only)
export async function updateListing(id, data) {
  return apiRequest(`/api/listings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// PATCH toggle a listing's active status (owning host only)
export async function updateListingStatus(id, isActive) {
  return apiRequest(`/api/listings/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });
}

// DELETE (deactivate) a listing (owning host only)
export async function deleteListing(id) {
  return apiRequest(`/api/listings/${id}`, {
    method: "DELETE",
  });
}