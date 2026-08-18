import { useEffect, useRef } from "react"; //useRef remembers the HTML map container and the Mapbox object.
import { useNavigate } from "react-router-dom";
import { getVehicleLabel } from "./ParkingSearchForm";
import mapboxgl from "mapbox-gl";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN ?? "";

export default function SearchMap({
  latitude,
  longitude,
  listings,
  hoveredListingId,
  onBoundsChange,
}) {
  //accepts listings to show them on the map by marker
  const navigate = useNavigate();
  const mapContainerRef = useRef(null); //remembers the HTML <div> | the empty <div> visible on the page
  const mapRef = useRef(null); //remembers the  Mapbox map | the Mapbox map placed inside that <div>
  const markersRef = useRef([]); //remembers every listing marker | useRef remebers its value across renders

  // map-creation useEffect
  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapContainerRef.current || mapRef.current) {
      return undefined;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [longitude, latitude],
      zoom: 13,
    });
    mapRef.current = map;

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right",
    );

    function reportVisibleBounds() {
      const visibleBounds = map.getBounds();

      onBoundsChange({
        west: visibleBounds.getWest(),
        south: visibleBounds.getSouth(),
        east: visibleBounds.getEast(),
        north: visibleBounds.getNorth(),
      });
    }

    map.on("load", reportVisibleBounds); //Runs once when the map initially finishes loading
    map.on("moveend", reportVisibleBounds); //"moveend" is an even provided by Mapbox.  It runs after the user finishes moving or zooming. We use it to display the new listings after the map is moved

    return () => {
      map.off("load", reportVisibleBounds);
      map.off("moveend", reportVisibleBounds);
      map.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude, onBoundsChange]);

  //markers-creation useEffect
  useEffect(() => {
    //Removing marker from the previous results
    //     Listings change
    //   → find every existing marker
    //   → remove it from the map
    //   → empty the remembered marker array
    //   → later create the new markers
    const map = mapRef.current;

    if (!map) {
      return;
    }

    markersRef.current.forEach((marker) => {
      marker.remove();
    });

    markersRef.current = [];

    listings.forEach((listing) => {
      if (listing.publicLatitude === null || listing.publicLongitude === null) {
        return;
      }

      const listingLatitude = Number(listing.publicLatitude);
      const listingLongitude = Number(listing.publicLongitude);

      if (
        !Number.isFinite(listingLatitude) ||
        !Number.isFinite(listingLongitude)
      ) {
        return;
      }

      // Mapbox positions this wrapper, so the button can grow without moving the map point.
      const markerWrapper = document.createElement("div");
      markerWrapper.className = "map-price-marker-wrapper";

      markerWrapper.dataset.listingId = String(listing.id); //dataset places the listing ID on the marker’s HTML wrapper. Conceptually, it creates something like: <div data-listing-id="7"></div>

      const markerButton = document.createElement("button");
      markerButton.type = "button";
      markerButton.className = "map-price-marker";
      markerButton.textContent = `$${(listing.hourlyPriceCents / 100).toFixed(2)}`;
      markerWrapper.append(markerButton);

      //creating popup mini listing to show when user click the price marker on the map
      const popupCard = document.createElement("a");
      popupCard.className = "map-listing-popup-card";
      popupCard.href = `/listings/${listing.id}`;
      popupCard.addEventListener("click", (event) => {
        // Navigate through the router instead of a full page reload.
        event.preventDefault();
        navigate(`/listings/${listing.id}`);
      });

      const popupImageArea = document.createElement("div");
      popupImageArea.className = "map-listing-popup-image-area";

      if (listing.imageUrl) {
        const popupImage = document.createElement("img");
        popupImage.className = "map-listing-popup-image";
        popupImage.src = listing.imageUrl;
        popupImage.alt = listing.title;

        popupImageArea.append(popupImage);
      } else {
        const popupImageEmpty = document.createElement("span");
        popupImageEmpty.className = "map-listing-popup-image-empty";
        popupImageEmpty.textContent = "Image unavailable";

        popupImageArea.append(popupImageEmpty);
      }

      if (listing.fitStatus) {
        const popupFit = document.createElement("p");

        popupFit.className =
          listing.fitStatus === "ACK_REQUIRED"
            ? "map-listing-popup-fit map-listing-popup-fit-warning"
            : "map-listing-popup-fit map-listing-popup-fit-confirmed";

        popupFit.textContent =
          listing.fitStatus === "ACK_REQUIRED"
            ? "! REVIEW FIT NOTES"
            : "✓ YOUR VEHICLE FITS";

        popupImageArea.append(popupFit);
      }

      popupCard.append(popupImageArea);

      const popupLocation = document.createElement("p");
      popupLocation.className = "map-listing-popup-location";

      const popupLocationIcon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
      );
      popupLocationIcon.classList.add("map-listing-popup-location-icon");
      popupLocationIcon.setAttribute("viewBox", "0 0 24 24");

      const popupLocationPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      popupLocationPath.setAttribute(
        "d",
        "M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z",
      );

      const popupLocationText = document.createElement("span");
      popupLocationText.textContent = `${listing.neighborhood} · ${listing.zipCode}`;

      popupLocationIcon.append(popupLocationPath);
      popupLocation.append(popupLocationIcon, popupLocationText);

      const popupTitle = document.createElement("h3");
      popupTitle.className = "map-listing-popup-title";
      popupTitle.textContent = listing.title;

      const popupVehicle = document.createElement("p");
      popupVehicle.className = "map-listing-popup-vehicle";
      popupVehicle.textContent = `Up to ${getVehicleLabel(listing.maxVehicleCategory).toLowerCase()}`;

      let popupDistance = null;
      if (Number.isFinite(listing.distanceMiles)) {
        popupDistance = document.createElement("p");
        popupDistance.className = "map-listing-popup-distance";
        popupDistance.textContent = `${listing.distanceMiles} mi from destination`;
      }

      const popupPrice = document.createElement("p");
      popupPrice.className = "map-listing-popup-price";

      const popupPriceAmount = document.createElement("strong");
      popupPriceAmount.className = "map-listing-popup-price-amount";
      popupPriceAmount.textContent = `$${(listing.hourlyPriceCents / 100).toFixed(2)}`;

      const popupPriceUnit = document.createElement("span");
      popupPriceUnit.textContent = " / hour";
      popupPrice.append(popupPriceAmount, popupPriceUnit);

      popupCard.append(popupLocation, popupTitle, popupVehicle);

      if (popupDistance) {
        popupCard.append(popupDistance);
      }
      popupCard.append(popupPrice);

      const popup = new mapboxgl.Popup({
        // Leave room for the price marker above it, but only a tiny gap below it.
        offset: {
          top: [0, 4],
          "top-left": [0, 4],
          "top-right": [0, 4],
          bottom: [0, -32],
          "bottom-left": [0, -32],
          "bottom-right": [0, -32],
          left: [4, 0],
          right: [-4, 0],
          center: [0, 0],
        },
        closeButton: false,
        closeOnClick: true,
      }).setDOMContent(popupCard); //places our mini listing card inside the popup. //setDOMContent() lets us insert listing text using textContent, which treats it as normal text. This is safer than inserting database values directly into an HTML string.

      popup.on("open", () => {
        markerButton.classList.add("map-price-marker-active");
      });
      popup.on("close", () => {
        markerButton.classList.remove("map-price-marker-active");
      });

      const marker = new mapboxgl.Marker({
        element: markerWrapper,
        anchor: "bottom", //means the bottom center of the button points to the listing’s map location
      })
        .setLngLat([listingLongitude, listingLatitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker); //adding marker to removal list
    });
  }, [listings, navigate]); //[listings] tells react run this effect whenever the listings array changes.

  //highlighting the price marker when the listing card is hovered
  useEffect(() => {
    markersRef.current.forEach((marker) => {
      const markerElement = marker.getElement();

      const isHovered =
        hoveredListingId !== null &&
        markerElement.dataset.listingId === String(hoveredListingId);

      markerElement.classList.toggle("map-price-marker-hovered", isHovered);
    });
  }, [hoveredListingId, listings]);

  if (!MAPBOX_TOKEN) {
    return <p className="app-alert">The Mapbox token is missing</p>;
  }

  return <div className="search-map" ref={mapContainerRef} />; //tells React to save this real <div> inside:mapContainerRef.current
}
