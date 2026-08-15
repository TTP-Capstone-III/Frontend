import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHostListings, getHostReservations } from "../api/reservations";
import { updateListingStatus, deleteListing } from "../api/listings";
import "../css/HostDashboard.css";

function HostDashboard() {
  const [listings, setListings] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [listingsData, reservationsData] = await Promise.all([
        getHostListings(),
        getHostReservations(),
      ]);
      setListings(listingsData);
      setReservations(reservationsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(listing) {
    setActionError(null);
    try {
      setBusyId(listing.id);
      await updateListingStatus(listing.id, !listing.isActive);
      await loadData();
    } catch (err) {
      setActionError(err.message || "Unable to update this listing.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(listing) {
    setActionError(null);

    const confirmed = window.confirm(
      `Delete "${listing.title}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setBusyId(listing.id);
      await deleteListing(listing.id);
      await loadData();
    } catch (err) {
      setActionError(err.message || "Unable to delete this listing.");
    } finally {
      setBusyId(null);
    }
  }

  const activeCount = listings.filter((l) => l.isActive).length;
  const confirmedCount = reservations.filter((r) => r.status === "CONFIRMED").length;

  return (
    <div className="page">
      <div className="page-content">
        <div className="dashboard-header">
          <div>
            <p className="eyebrow">Host workspace</p>
            <h1 className="page-title">Your parking business</h1>
            <p className="page-subtitle">Manage spaces and see who's arriving next.</p>
          </div>

          <Link to="/host/listings/new" className="btn-amber">
            + Add a parking spot
          </Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-number">{loading ? "…" : listings.length}</p>
            <p className="stat-label">Total listings</p>
          </div>
          <div className="stat-card">
            <p className="stat-number">{loading ? "…" : activeCount}</p>
            <p className="stat-label">Active spaces</p>
          </div>
          <div className="stat-card">
            <p className="stat-number">{loading ? "…" : confirmedCount}</p>
            <p className="stat-label">Confirmed reservations</p>
          </div>
        </div>

        {actionError && <p className="form-error">{actionError}</p>}

        <div className="section">
          <h2 className="section-title">Your listings</h2>
          {listings.length === 0 ? (
            <div className="empty-state">
              <p>Your first driveway can be live in a few minutes.</p>
              <Link to="/host/listings/new">Create a listing</Link>
            </div>
          ) : (
            <div className="listings-grid">
              {listings.map((listing) => (
                <div key={listing.id} className="listing-card">
                  <img src={listing.imageUrl} alt={listing.title} />
                  <div className="listing-card-body">
                    <p className="listing-card-title">{listing.title}</p>
                    <p className="listing-card-sub">{listing.neighborhood}</p>
                    <span className={`status-badge ${listing.isActive ? "" : "inactive"}`}>
                      {listing.isActive ? "Active" : "Inactive"}
                    </span>

                    <div className="listing-card-actions">
                      <button
                        onClick={() => handleToggleStatus(listing)}
                        disabled={busyId === listing.id}
                        className="btn-secondary btn-small"
                      >
                        {listing.isActive ? "Deactivate" : "Reactivate"}
                      </button>
                      <button
                        onClick={() => handleDelete(listing)}
                        disabled={busyId === listing.id}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section">
          <h2 className="section-title">Received reservations</h2>
          {reservations.length === 0 ? (
            <p className="page-subtitle">Reservations will appear here when drivers book.</p>
          ) : (
            reservations.map((r) => (
              <div key={r.id} className="reservation-row">
                <div>
                  <p className="reservation-row-title">{r.listing?.title}</p>
                  <p className="reservation-row-sub">Driver: {r.driver?.name}</p>
                </div>
                <span className="status-badge">{r.status}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default HostDashboard;