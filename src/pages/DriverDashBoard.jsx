import { Link } from "react-router-dom";
import DriverReservations from "../components/DriverReservation.jsx";
import "../css/HostDashboard.css";
import "../styles/pages/search-results-page.css";
import "../css/DriverDashboard.css";

function DriverDashBoard() {
  return (
    <div className="page driver-dashboard-page">
      <div className="page-content">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Driver dashboard</p>
            <h1 className="page-title">Your parking plans</h1>
            <p className="page-subtitle">
              Review upcoming parking details and manage your reservations.
            </p>
          </div>

          <Link to="/" className="btn-amber">
            Find parking
          </Link>
        </header>

        <DriverReservations />
      </div>
    </div>
  );
}

export default DriverDashBoard;
