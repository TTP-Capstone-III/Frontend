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

      <div className="navbar-links">
        <NavLink className="navbar-link" to="/" end>
          Find parking
        </NavLink>
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
        {user ? (
          <>
            <span className="navbar-user">Hi, {user.name}</span>

            <button type="button" onClick={logout} className="navbar-button">
              Log out
            </button>
          </>
        ) : (
          <NavLink className="navbar-button" to="/auth">
            Log in / Sign up
          </NavLink>
        )}
      </div>
    </nav>
  );
}
