import { useEffect, useRef, useState } from "react";
import { useSearchBoxCore } from "@mapbox/search-js-react";

// Vite exposes the public Mapbox token from the frontend environment file.
const accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN ?? "";

export function parseMapboxLocation(response) {
  // A retrieve response may be empty, so check its first feature before using it.
  const feature = response.features[0];

  if (!feature) {
    return null;
  }

  const properties = feature.properties;

  const coordinates = feature.geometry.coordinates;

  if (!coordinates) {
    return null;
  }

  // GeoJSON coordinates always use longitude first and latitude second.
  const longitude = coordinates[0];
  const latitude = coordinates[1];

  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return null;
  }

  let fullAddress = properties.full_address;

  if (!fullAddress) {
    fullAddress = properties.name;
  }

  return {
    label: fullAddress,
    latitude: latitude,
    longitude: longitude,
  };
}

export default function LocationSearchInput({
  value,
  onChange,
  onSelect,
  onUseCurrentLocation,
  findingLocation,
  placeholder,
}) {
  // Configure Mapbox suggestions for United States locations in English.
  const searchBoxCore = useSearchBoxCore({
    accessToken: accessToken,
    country: "US",
    language: "en",
    limit: 5,
  });

  // This DOM reference helps detect clicks outside the custom dropdown.
  const locationSearchRef = useRef(null);

  // One session ID connects a Mapbox suggestion request to its retrieve request.
  const searchSessionRef = useRef(window.crypto.randomUUID());

  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Store a user-friendly message when a Mapbox request fails.
  const [searchError, setSearchError] = useState("");

  // Ask Mapbox for suggestions shortly after the user stops typing.
  useEffect(() => {
    const searchText = value.trim();

    if (!accessToken || !isOpen || searchText.length < 2) {
      setSuggestions([]);
      return;
    }

    // Cancel an older request when the user changes the search text again.
    const abortController = new AbortController();

    const searchDelay = window.setTimeout(async () => {
      try {
        const response = await searchBoxCore.suggest(searchText, {
          sessionToken: searchSessionRef.current,
          signal: abortController.signal,
        });

        setSuggestions(response.suggestions);
      } catch (error) {
        // Ignore cancelled searches, but remember a real Mapbox failure.
        if (error.name !== "AbortError") {
          setSuggestions([]);
          setSearchError("Location search is temporarily unavailable.");
        }
      }
    }, 300);

    // React runs this cleanup before the next search or when the component closes.
    return () => {
      window.clearTimeout(searchDelay);
      abortController.abort();
    };
  }, [isOpen, searchBoxCore, value]);

  // Close the dropdown when the user clicks somewhere outside this component.
  useEffect(() => {
    function handleOutsideClick(event) {
      if (!locationSearchRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, []);

  function handleInputChange(event) {
    onChange(event.target.value);
    setIsOpen(true);
  }

  function handleClear() {
    onChange("");
    setSuggestions([]);
    setIsOpen(true);
  }

  async function handleSuggestionSelect(suggestion) {
    try {
      // Suggestions contain labels; retrieve adds the selected coordinates.
      const response = await searchBoxCore.retrieve(suggestion, {
        sessionToken: searchSessionRef.current,
      });

      const selectedLocation = parseMapboxLocation(response);

      if (selectedLocation) {
        onSelect(selectedLocation);
      }

      // A completed selection starts a new Mapbox search session next time.
      searchSessionRef.current = window.crypto.randomUUID();
      setSuggestions([]);
      setIsOpen(false);
    } catch {
      // Remove unusable results and remember that selection failed.
      setSuggestions([]);
      setSearchError("We could not select that location. Please try again.");
    }
  }

  function handleCurrentLocation() {
    if (!onUseCurrentLocation) {
      return;
    }

    setIsOpen(false);
    onUseCurrentLocation();
  }

  return (
    <div className="location-search" ref={locationSearchRef}>
      <div className={`location-search-control ${isOpen ? "is-open" : ""}`}>
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
        />

        {value && (
          <button
            className="location-search-clear"
            type="button"
            onClick={handleClear}
            title="Clear location"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        // Current location and Mapbox results share one custom dropdown.
        <div className="location-search-dropdown">
          {onUseCurrentLocation ? (
            <button
              className="location-search-option current-location-option"
              type="button"
              onClick={handleCurrentLocation}
              disabled={findingLocation}
            >
              <svg
                className="current-location-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>

              <span>
                {findingLocation
                  ? "Finding your location..."
                  : "Use my current location"}
              </span>
            </button>
          ) : null}

          {suggestions.map((suggestion) => (
            <button
              className="location-search-option mapbox-location-option"
              type="button"
              key={suggestion.mapbox_id}
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <strong>{suggestion.name}</strong>
              {suggestion.place_formatted && (
                <span>{suggestion.place_formatted}</span>
              )}
            </button>
          ))}

          {suggestions.length > 0 && (
            <small className="mapbox-attribution">Powered by Mapbox</small>
          )}
        </div>
      )}
    </div>
  );
}
