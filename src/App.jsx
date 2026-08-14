import { Navigate, Route, Routes, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import AuthPage from "./pages/AuthPage";
import ListingPage from "./pages/ListingPage.jsx";
import { useAuth } from "./context/AuthContext";
import BookingSuccess from "./pages/BookingSuccess.jsx";
import HostReservations from "./components/HostReservations.jsx";
import ReservationCard from "./components/ReservationCard.jsx";
import ReservationForm from "./components/ReservationForm.jsx";
import { getDriverReservations, cancelReservation } from "./api/reservation";
import { getListingById } from "./api/listings";

function DriverPage({ user, logout }) {
  const [searchParams] = useSearchParams(); // ✅ now inside a routed component
  const justBooked = searchParams.get("booked") === "1";

  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const [listingIdInput, setListingIdInput] = useState("");
  const [selectedListing, setSelectedListing] = useState(null);
  const [listingError, setListingError] = useState(null);
  const [listingLoading, setListingLoading] = useState(false);

  useEffect(() => {
    loadReservations();
  }, []);

  async function loadReservations() {
    try {
      setReservationsLoading(true);
      const data = await getDriverReservations();
      setReservations(data);
    } catch (err) {
      setReservationsError(err.message || "Unable to load your reservations.");
    } finally {
      setReservationsLoading(false);
    }
  }

  async function handleCancel(id) {
    setReservationsError(null);
    try {
      setCancellingId(id);
      await cancelReservation(id);
      await loadReservations();
    } catch (err) {
      setReservationsError(err.message || "Unable to cancel this reservation.");
    } finally {
      setCancellingId(null);
    }
  }

  async function handleFindListing(e) {
    e.preventDefault();
    setListingError(null);
    setSelectedListing(null);

    if (!listingIdInput) {
      setListingError("Enter a listing id");
      return;
    }

    try {
      setListingLoading(true);
      const listing = await getListingById(listingIdInput);
      setSelectedListing(listing);
    } catch (err) {
      setListingError(err.message || "Listing not found");
    } finally {
      setListingLoading(false);
    }
  }

  const now = new Date();
  const upcoming = reservations.filter(
    (r) => r.status === "CONFIRMED" && new Date(r.endTime) > now
  );
  const pastOrCancelled = reservations.filter(
    (r) => r.status === "CANCELLED" || new Date(r.endTime) <= now
  );

  return (
    <main>
      <h1>Welcome, {user?.name}</h1>
      {/* <p>{user?.email}</p> */}
      <button type="button" onClick={logout}>
        Log out
      </button>

      {justBooked && <p>Your reservation is confirmed!</p>}

      <h2>Book a listing</h2>
      <form onSubmit={handleFindListing}>
        <label>
          Listing ID
          <input
            type="number"
            value={listingIdInput}
            onChange={(e) => setListingIdInput(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={listingLoading}>
          {listingLoading ? "Loading..." : "Find listing"}
        </button>
      </form>
      {listingError && <p style={{ color: "red" }}>{listingError}</p>}

      {selectedListing && (
        <div>
          <h3>{selectedListing.title}</h3>
          <p>
            {selectedListing.streetAddress}, {selectedListing.neighborhood}
          </p>
          <ReservationForm listing={selectedListing} />
        </div>
      )}

      {reservationsError && <p style={{ color: "red" }}>{reservationsError}</p>}

      {reservationsLoading ? (
        <p>Loading your reservations...</p>
      ) : (
        <>
          <h2>Upcoming</h2>
          {upcoming.length === 0 ? (
            <p>No upcoming reservations.</p>
          ) : (
            upcoming.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                onCancel={cancellingId === r.id ? undefined : handleCancel}
              />
            ))
          )}

          <h2>Past & Cancelled</h2>
          {pastOrCancelled.length === 0 ? (
            <p>Nothing here yet.</p>
          ) : (
            pastOrCancelled.map((r) => <ReservationCard key={r.id} reservation={r} />)
          )}
        </>
      )}
    </main>
  );
}

export default function App() {
  // Read the authentication state supplied by AuthProvider.
  // reads the values supplied by:  <AuthContext.Provider value={{ user, loading, login, signup, logout }}></AuthContext.Provider>
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <main>
        <p>Checking session...</p>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />

      <Routes>
        <Route
          path="/auth"
          element={user ? <Navigate to="/driver" replace /> : <AuthPage />}
        />

        <Route path="/booking-success" element={<BookingSuccess />} />

        <Route
          path="/driver"
          element={
            <ProtectedRoute>
              <DriverPage user={user} logout={logout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/host"
          element={
            <ProtectedRoute>
              <main>
                <h1>Host reservations</h1>
                <HostReservations />
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/listings"
          element={
            <ProtectedRoute>
              <ListingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={<Navigate to={user ? "/driver" : "/auth"} replace />}
        />

        {/* Send unknown URLs through the same login-based root redirect. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}