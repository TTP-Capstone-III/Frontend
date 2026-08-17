import { Link } from "react-router-dom";
import DriverReservation from "../components/DriverReservation.jsx";
import "../css/DriverDashboard.css";

function DriverDashBoard() {
  return (
    <div className="page">
      <div className="page-content">
        <div className="dashboard-header">
          <div>
            <p className="eyebrow">Driver workspace</p>
            <h1 className="page-title">Your trips</h1>
            <p className="page-subtitle">Track upcoming reservations and past parking history.</p>
          </div>

          <Link to="/" className="btn-amber">
            + Find parking
          </Link>
        </div>

        <DriverReservation />
      </div>
    </div>
  );
}

export default DriverDashBoard;
