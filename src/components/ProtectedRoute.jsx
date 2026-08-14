import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    // Wait for /api/auth/me before deciding whether access is allowed.
    return <p>Checking session...</p>;
  }

  if (!user) {
    // Replace the protected URL so Back does not reopen it and redirect again.
    return <Navigate to="/auth" replace />;
  }

  // A confirmed session is allowed to render the protected page.
  return children;
}
