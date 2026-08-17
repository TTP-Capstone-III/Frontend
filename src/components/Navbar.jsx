import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/components/navbar.css";
import { useState } from "react";

export default function Navbar() {
  // Track logout progress and a failed request so the Navbar can show feedback.
  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const { user, logout } = useAuth();

  async function handleLogout() {
    setLogoutError("");
    setLoggingOut(true);

    try {
      await logout();
    } catch {
      setLogoutError("Could not log out. Please try again.");
    } finally {
      // Restore the button after either a successful or failed request.
      setLoggingOut(false);
    }
  }

  return (
    <nav className="site-navbar">
      <NavLink className="navbar-brand" to="/">
        <span className="navbar-brand-mark">P</span>
        <span>ParkNGo</span>
      </NavLink>

      <div className="navbar-links">
        <NavLink className="navbar-link" to="/" end>
          Find parking
        </NavLink>

        {/* Dashboard links are visible only when a session user exists. */}
        {user ? (
          <>
            <NavLink className="navbar-link" to="/driver">
              Driver dashboard
            </NavLink>
            <NavLink className="navbar-link" to="/host">
              Host dashboard
            </NavLink>
          </>
        ) : null}
      </div>

      <div className="navbar-account">
        {/* Show account actions for a user or the auth link for a guest. */}
        {user ? (
          <>
            <span className="navbar-user">{user.name}</span>

            <button
              type="button"
              onClick={handleLogout}
              className="navbar-button"
              disabled={loggingOut}
            >
              {loggingOut ? "Logging out..." : "Log out"}
            </button>
          </>
        ) : (
          <NavLink className="navbar-button" to="/auth">
            Log in / Sign up
          </NavLink>
        )}

        {/* Keep a failed logout visible without ending the current session. */}
        {logoutError ? (
          <p className="navbar-logout-error app-alert" role="alert">
            {logoutError}
          </p>
        ) : null}
      </div>
    </nav>
  );
}
