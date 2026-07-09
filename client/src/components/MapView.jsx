import { useEffect, useState } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Color per day so markers stay visually grouped.
const dayColors = [
  "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#3b82f6", "#a855f7", "#ec4899",
];

// `proximity` (the destination center) biases Mapbox toward the right region so
// an ambiguous name (e.g. a "Victoria Park" that exists on 5 continents) resolves
// near the trip, not thousands of km away. Returns relevance so the caller can
// drop low-confidence guesses instead of dropping a wrong pin on the map.
async function geocodePlace(placeName, destination, proximity) {
  const query = destination ? `${placeName}, ${destination}` : placeName;
  let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=1&language=en`;
  if (proximity) url += `&proximity=${proximity.lng},${proximity.lat}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.features && data.features.length > 0) {
      const f = data.features[0];
      const [lng, lat] = f.center;
      return { lat, lng, relevance: f.relevance ?? 0 };
    }
    return null;
  } catch {
    return null;
  }
}

// Rough great-circle distance in km, to sanity-check a pin against the destination.
function distanceKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Decide what (if anything) to pin for an activity.
// New itineraries include a `place` field: a concrete landmark name, or "" when
// the activity isn't a mappable spot (e.g. "lunch at a local café") — we skip those.
// Older itineraries have no `place` field, so we fall back to the title.
function mappableLabel(activity) {
  if (typeof activity.place === "string") {
    return activity.place.trim() ? activity.place.trim() : null; // "" => skip
  }
  return activity.name || activity.title || null; // legacy fallback
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

      const destCoords = await geocodePlace(destination, "");
      if (destCoords) {
        setViewState({ longitude: destCoords.lng, latitude: destCoords.lat, zoom: 12 });
      }

      // Only collect activities that resolve to a concrete, mappable place.
      const candidates = [];
      itinerary.forEach((day, dayIndex) => {
        (day.activities || []).forEach((activity) => {
          const label = mappableLabel(activity);
          if (label) {
            candidates.push({ label, time: activity.time || "", day: dayIndex + 1 });
          }
        });
      });

      const results = await Promise.all(
        candidates.map(async (c) => {
          const coords = await geocodePlace(c.label, destination, destCoords);
          if (!coords) return null;
          // Drop shaky matches: low confidence, or absurdly far from the destination
          // (a wrong-continent homonym) — better no pin than a misleading one.
          if (coords.relevance < 0.5) return null;
          if (destCoords && distanceKm(destCoords, coords) > 3000) return null;
          return { ...c, ...coords };
        }),
      );

      setMarkers(results.filter(Boolean));
      setLoading(false);
    }

    loadMarkers();
  }, [destination, itinerary]);

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
              anchor="left"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedMarker(marker);
              }}
            >
              {/* Labeled pin: colored dot + place name */}
              <div className="flex items-center gap-1 cursor-pointer group">
                <span
                  className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-md shrink-0"
                  style={{ backgroundColor: dayColors[(marker.day - 1) % dayColors.length] }}
                />
                <span className="text-[10px] font-semibold text-gray-800 bg-white/90 group-hover:bg-white px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap max-w-[150px] truncate transition">
                  {marker.label}
                </span>
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

          {markers.length === 0 && (
            <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none">
              <span className="text-[11px] bg-white/90 text-gray-600 px-3 py-1 rounded-full shadow">
                No specific landmarks to pin for this trip.
              </span>
            </div>
          )}
        </Map>
      )}
    </div>
  );
}
