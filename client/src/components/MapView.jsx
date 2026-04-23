import { useEffect, useState } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

async function geocodePlace(placeName, destination) {
  const query = `${placeName}, ${destination}`;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
    return null;
  } catch {
    return null;
  }
}

export default function MapView({ destination, itinerary }) {
  const [markers, setMarkers] = useState([]);
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 1.5,
  });
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!destination || !itinerary) return;

    async function loadMarkers() {
      setLoading(true);

      // First geocode the destination itself to center the map
      const destCoords = await geocodePlace(destination, "");
      if (destCoords) {
        setViewState({
          longitude: destCoords.lng,
          latitude: destCoords.lat,
          zoom: 12,
        });
      }

      // Now geocode every activity across all days
      const allActivities = [];
      itinerary.forEach((day, dayIndex) => {
        (day.activities || []).forEach((activity) => {
          allActivities.push({
            label: activity.name || activity.title || activity.description || "Activity",
            time: activity.time || "",
            day: dayIndex + 1,
          });
        });
      });

      // Geocode in parallel (Promise.all), skip nulls
      const results = await Promise.all(
        allActivities.map(async (activity) => {
          const coords = await geocodePlace(activity.label, destination);
          if (!coords) return null;
          return { ...activity, ...coords };
        })
      );

      setMarkers(results.filter(Boolean));
      setLoading(false);
    }

    loadMarkers();
  }, [destination, itinerary]);

  // Color per day so markers are visually grouped
  const dayColors = [
    "#ef4444", "#f97316", "#eab308",
    "#22c55e", "#3b82f6", "#a855f7", "#ec4899",
  ];

  return (
    <div className="w-full rounded-xl overflow-hidden" style={{ height: "450px" }}>
      {loading && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
          Loading map...
        </div>
      )}

      {!loading && (
        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: "100%", height: "100%" }}
        >
          {markers.map((marker, i) => (
            <Marker
              key={i}
              longitude={marker.lng}
              latitude={marker.lat}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedMarker(marker);
              }}
            >
              <div className="relative flex items-center justify-center cursor-pointer group">
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold"
                  style={{
                    backgroundColor: dayColors[(marker.day - 1) % dayColors.length],
                    fontSize: "9px",
                  }}
                  title={marker.label}
                >
                  {marker.day}
                </div>
              </div>
            </Marker>
          ))}

          {selectedMarker && (
            <Popup
              longitude={selectedMarker.lng}
              latitude={selectedMarker.lat}
              anchor="top"
              onClose={() => setSelectedMarker(null)}
              closeOnClick={false}
            >
              <div className="text-xs p-1">
                <p className="font-semibold">{selectedMarker.label}</p>
                <p className="text-gray-500">Day {selectedMarker.day} · {selectedMarker.time}</p>
              </div>
            </Popup>
          )}
        </Map>
      )}
    </div>
  );
}