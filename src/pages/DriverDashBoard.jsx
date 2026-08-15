import DriverReservation from "../components/DriverReservation.jsx";
import "../css/hostDashboard.css"; 

function DriverDashBoard() {
  return (
    <div className="page">
      <div className="page-content">
        <h1>Upcoming & Past Reservations</h1>
        <DriverReservation />
      </div>
    </div>
  );
}

export default DriverDashBoard;