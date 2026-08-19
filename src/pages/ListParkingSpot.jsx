import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createListing } from "../api/listings";
import "../css/ListSpot.css";

const VEHICLE_OPTIONS = [
  { value: "COMPACT", label: "Compact" },
  { value: "SEDAN", label: "Sedan / wagon — Toyota Corolla or Honda Accord" },
  { value: "SMALL_SUV", label: "Small SUV" },
  { value: "LARGE_SUV_MINIVAN", label: "Large SUV / Minivan" },
  { value: "PICKUP", label: "Pickup Truck" },
  { value: "OTHER_NOT_SURE", label: "Other / Not sure" },
];

function ListParkingSpot() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    instructions: "",
    streetAddress: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    hourlyPriceCents: "",
    availableFrom: "",
    availableUntil: "",
    maxVehicleCategory: "SEDAN",
    otherVehicleDescription: "",
    imageFile: null,
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.imageFile) {
      setError("Please choose a parking photo.");
      return;
    }

    try {
      setSubmitting(true);
      //use FormData(), because photo is a binary File, not ordinary JSON data
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("instructions", form.instructions);
      formData.append("streetAddress", form.streetAddress);
      formData.append("neighborhood", form.neighborhood);
      formData.append("city", form.city);
      formData.append("state", form.state);
      formData.append("zipCode", form.zipCode);
      formData.append(
        "hourlyPriceCents",
        String(Math.round(Number(form.hourlyPriceCents) * 100)),
      );
      formData.append(
        "availableFrom",
        new Date(form.availableFrom).toISOString(),
      );
      formData.append(
        "availableUntil",
        new Date(form.availableUntil).toISOString(),
      );
      formData.append("maxVehicleCategory", form.maxVehicleCategory);
      formData.append("exactLatitude", "39.7817");
      formData.append("exactLongitude", "-89.6501");
      formData.append("image", form.imageFile);

      if (form.maxVehicleCategory === "OTHER_NOT_SURE") {
        formData.append(
          "otherVehicleDescription",
          form.otherVehicleDescription ||
            "Fit unclear — please confirm before booking.",
        );
      }

      await createListing(formData);

      navigate("/host?listed=1");
    } catch (err) {
      setError(err.message || "Unable to publish this listing.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="page-content-narrow">
        <Link to="/host" className="back-link">
          ← Host dashboard
        </Link>

        <p className="eyebrow eyebrow-amber">Become a host</p>
        <h1 className="form-title">List your parking spot</h1>
        <p className="form-subtitle">
          Give drivers the data they need to park confidently.
        </p>

        <form onSubmit={handleSubmit}>
          <section className="form-section">
            <h2 className="form-section-title">About the space</h2>

            <div className="form-field">
              <label>Listing title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Wide driveway near Astoria Park"
                required
                minLength={5}
                maxLength={100}
              />
            </div>

            <div className="form-field">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
                required
                minLength={20}
                maxLength={1200}
              />
            </div>

            <div className="form-field">
              <label>Parking instructions</label>
              <textarea
                value={form.instructions}
                onChange={(e) => updateField("instructions", e.target.value)}
                rows={2}
                placeholder="Tell the confirmed driver exactly where to enter and park."
                required
                minLength={10}
                maxLength={800}
              />
            </div>
          </section>

          <section className="form-section">
            <h2 className="form-section-title">Location</h2>
            <p className="form-section-hint">
              The exact address stays private until a booking is confirmed.
            </p>

            <div className="form-field">
              <label>Street address</label>
              <input
                type="text"
                value={form.streetAddress}
                onChange={(e) => updateField("streetAddress", e.target.value)}
                placeholder="123 Main St"
                required
                minLength={5}
                maxLength={150}
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Neighborhood</label>
                <input
                  type="text"
                  value={form.neighborhood}
                  onChange={(e) => updateField("neighborhood", e.target.value)}
                  required
                  minLength={2}
                  maxLength={80}
                />
              </div>
              <div className="form-field">
                <label>City / borough</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  required
                  minLength={2}
                  maxLength={80}
                />
              </div>
              <div className="form-field">
                <label>State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) =>
                    updateField("state", e.target.value.toUpperCase())
                  }
                  maxLength={2}
                  required
                />
              </div>
              <div className="form-field">
                <label>ZIP code</label>
                <input
                  type="text"
                  value={form.zipCode}
                  onChange={(e) => updateField("zipCode", e.target.value)}
                  maxLength={5}
                  required
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2 className="form-section-title">Price and availability</h2>

            <div className="form-field">
              <label>Hourly price (USD)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                max="1000"
                value={form.hourlyPriceCents}
                onChange={(e) =>
                  updateField("hourlyPriceCents", e.target.value)
                }
                required
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Available from</label>
                <input
                  type="datetime-local"
                  value={form.availableFrom}
                  onChange={(e) => updateField("availableFrom", e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label>Available until</label>
                <input
                  type="datetime-local"
                  value={form.availableUntil}
                  onChange={(e) =>
                    updateField("availableUntil", e.target.value)
                  }
                  required
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2 className="form-section-title">Vehicle fit</h2>
            <p className="form-section-hint">
              Choose the largest vehicle that fits comfortably — not the
              tightest possible fit.
            </p>

            <div className="form-field">
              <label>Largest vehicle that fits</label>
              <select
                value={form.maxVehicleCategory}
                onChange={(e) =>
                  updateField("maxVehicleCategory", e.target.value)
                }
              >
                {VEHICLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {form.maxVehicleCategory === "OTHER_NOT_SURE" && (
              <div className="form-field">
                <label>Describe the space</label>
                <input
                  type="text"
                  value={form.otherVehicleDescription}
                  onChange={(e) =>
                    updateField("otherVehicleDescription", e.target.value)
                  }
                  placeholder="e.g. Fits most cars, but tight for larger SUVs"
                  maxLength={180}
                />
              </div>
            )}
          </section>

          <section className="form-section">
            <h2 className="form-section-title">Parking photo</h2>

            <div className="photo-upload-box">
              <label className="btn-amber photo-upload-label">
                Choose one photo
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  required
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      updateField("imageFile", e.target.files[0]);
                    }
                  }}
                />
              </label>
              {/* JavaScript check protects request, required gives host immediate browser feedback before submission. */}
              <span className="photo-upload-hint">
                JPG, PNG, or WebP — 5 MB maximum
              </span>
              {form.imageFile && (
                <p className="photo-upload-hint">
                  Selected: {form.imageFile.name}
                </p>
              )}
              {/* proves browser gave React actual File object, without uploading it early or creating a temporary URL. */}
            </div>
          </section>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <Link to="/host" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={submitting} className="btn-amber">
              {submitting ? "Publishing..." : "Publish parking spot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ListParkingSpot;
