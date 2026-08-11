import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import AuthPage from "./pages/AuthPage";
import { useAuth } from "./context/AuthContext";

export default function App() {
  // Read the authentication state supplied by AuthProvider.
  // reads the values supplied by:  <AuthContext.Provider value={{ user, loading, login, signup, logout }}></AuthContext.Provider>
  const { user, loading } = useAuth();

  if (loading) {
    // Avoid redirecting before the initial session check finishes.
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

        <Route
          path="/driver"
          element={
            <ProtectedRoute>
              <main>
                {/* ?. avoids a crash if user is null before the redirect. */}
                <h1>Welcome, {user?.name}</h1>
                <p>{user?.email}</p>
              </main>
            </ProtectedRoute>
          }
        />

        <Route
          path="/host"
          element={
            <ProtectedRoute>
              <main>
                <h1>Host reservations</h1>
              </main>
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
