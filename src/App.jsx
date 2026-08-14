import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage.jsx";
import DriverDashBoard from "./pages/DriverDashBoard.jsx";
import HostDashboard from "./pages/HostDashboard.jsx";
import ListingPage from "./pages/ListingPage.jsx";
import ListParkingSpot from "./pages/ListParkingSpot.jsx";
import BookingSuccess from "./pages/BookingSuccess.jsx";
import { useAuth } from "./context/AuthContext.jsx";

export default function App() {
  const { user, loading } = useAuth();

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
        {/* Keep authenticated users out of the login and signup page. */}
        <Route
          path="/auth"
          element={user ? <Navigate to="/driver" replace /> : <AuthPage />}
        />

        <Route path="/booking-success" element={<BookingSuccess />} />

        <Route
          path="/driver"
          element={
            <ProtectedRoute>
              <DriverDashBoard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/host"
          element={
            <ProtectedRoute>
              <HostDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/host/listings/new"
          element={
            <ProtectedRoute>
              <ListParkingSpot />
            </ProtectedRoute>
          }
        />

        {/* Preserve the old listings URL by sending it to the homepage. */}
        <Route path="/listings" element={<Navigate to="/" replace />} />

        <Route path="/" element={<HomePage />} />

        {/* Send unknown URLs back to the public homepage. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </div>
  );
}