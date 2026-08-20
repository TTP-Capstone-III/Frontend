const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "" : "http://localhost:5050");

// Centralize the backend URL, cookie handling, JSON parsing, and API errors.
//path->where should the request go , options->how should the request be sent
async function apiRequest(path, options = {}) {
  // Add caller-specific options first, then always include the session cookie.
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include", // Send and receive the HTTP-only session cookie.
  });
  const responseBody = await response.json(); //the JSON body sent by the backend

  if (!response.ok) {
    // Turn unsuccessful HTTP responses into errors that pages can catch.
    const error = new Error(responseBody.error || "Request failed");
    error.status = response.status; // Preserve the status for feature-specific handling.
    throw error;
  }

  return responseBody;
}

export default apiRequest;
