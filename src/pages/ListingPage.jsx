import { useState } from "react";
import "../styles/pages/listing-page.css";

const DEFAULT_LISTINGS = [
  {
    id: "manhattan",
    title: "Manhattan Garage Spot",
    description: "Close to transit, easy in-and-out access for city trips.",
    city: "Manhattan",
    state: "NY",
    hourlyPriceCents: 1800,
    imageUrl: "/images/manhattan.png",
  },
  {
    id: "brooklyn",
    title: "Brooklyn Private Driveway",
    description: "Residential parking with a quick walk to local shops.",
    city: "Brooklyn",
    state: "NY",
    hourlyPriceCents: 1400,
    imageUrl: "/images/brooklynBridge.jpg",
  },
  {
    id: "queens",
    title: "Queens Covered Spot",
    description: "Covered parking with room for an easy arrival and exit.",
    city: "Queens",
    state: "NY",
    hourlyPriceCents: 1200,
    imageUrl: "/images/Queens.jpg",
  },
  {
    id: "bronx",
    title: "Bronx Corner Lot",
    description: "Open corner lot with a simple pull-in and plenty of space.",
    city: "Bronx",
    state: "NY",
    hourlyPriceCents: 1000,
    imageUrl: "/images/Bronx.jpg",
  },
  {
    id: "staten-island",
    title: "Staten Island Side Lot",
    description: "Quiet space with a wider entrance for stress-free parking.",
    city: "Staten Island",
    state: "NY",
    hourlyPriceCents: 1100,
    imageUrl: "/images/StatenIsland.jpg",
  },
];

export default function ListingPage() {
  const [listings, setListings] = useState(DEFAULT_LISTINGS);

  return (
    <main className="listing-page">
      <section className="listing-header">
        <h1>Find a spot before your drive</h1>

        <div className="listing-searchbar">
          <div>
            <span>Where</span>
            <input
              type="text"
              defaultValue="Destination"
              placeholder="Destination"
            />
          </div>
          <div>
            <span>When</span>
            <input type="datetime-local" defaultValue="2026-08-13T12:00" />
          </div>
          <div>
            <span>What</span>
            <select defaultValue="SEDAN">
              <option value="COMPACT">Compact</option>
              <option value="SEDAN">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="LARGE_SUV_MINIVAN">Large SUV / Minivan</option>
              <option value="TRUCK">Truck</option>
              <option value="OTHER_NOT_SURE">Other / Not sure</option>
            </select>
          </div>

          <button type="button">Search</button>
        </div>
      </section>

      <section className="listing-grid">
        {listings.length === 0 ? <p>No Listings found.</p> : null}

        {listings.map((listing) => (
          <div key={listing.id}>
            {listing.imageUrl ? (
              <img src={listing.imageUrl} alt={listing.title} />
            ) : null}
            <div>
              <div>
                <h2>{listing.title}</h2>
                <span>${(listing.hourlyPriceCents / 100).toFixed(2)}/hr</span>
              </div>
              <p>{listing.description}</p>
              <p>
                {listing.city}, {listing.state}
              </p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
