import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/components/navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="site-navbar">
      <NavLink className="navbar-brand" to="/">
        <span className="navbar-brand-mark">P</span>
        <span>ParkNGo</span>
      </NavLink>
      {user ? (
        <div className="navbar-actions">
          <NavLink className="navbar-link" to="/listings">
            Listings
          </NavLink>
          <NavLink className="navbar-link" to="/driver">
            Driver
          </NavLink>
          <NavLink className="navbar-link" to="/host">
            Host
          </NavLink>

          <span className="navbar-user">Hi, {user.name}</span>

          <button type="button" onClick={logout} className="navbar-button">
            Log out
          </button>
        </div>
      ) : (
        <NavLink className="navbar-button" to="/auth">
          Log in / Sign up
        </NavLink>
      )}
    </nav>
  );
}
