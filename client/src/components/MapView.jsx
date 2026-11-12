import { useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getPins } from "../services/geoService";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Color per day so markers stay visually grouped.
const dayColors = [
  "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#3b82f6", "#a855f7", "#ec4899",
];
const dayColor = (day) => dayColors[(day - 1) % dayColors.length];

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

// Camera that shows every point: one pin gets street-level zoom, several get
// fitted bounds, none falls back to the destination itself.
function cameraFor(points, center) {
  if (points.length === 0) {
    return center
      ? { longitude: center.lng, latitude: center.lat, zoom: 11 }
      : { longitude: 0, latitude: 20, zoom: 1.5 };
  }
  if (points.length === 1) {
    return { longitude: points[0].lng, latitude: points[0].lat, zoom: 13 };
  }
  const lngs = points.map((p) => p.lng);
  const lats = points.map((p) => p.lat);
  return {
    bounds: [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ],
    fitBoundsOptions: { padding: 60, maxZoom: 14 },
  };
}

export default function MapView({ destination, itinerary }) {
  const mapRef = useRef(null);
  const [fetched, setFetched] = useState({ key: null }); // { key, data } or { key, error }
  const [activeDay, setActiveDay] = useState(null); // null = all days
  const [selectedKey, setSelectedKey] = useState(null);

  // Every activity that names a mappable place.
  const visits = useMemo(() => {
    const out = [];
    (itinerary || []).forEach((day, dayIndex) => {
      (day.activities || []).forEach((activity) => {
        const label = mappableLabel(activity);
        if (label) {
          out.push({ label, day: dayIndex + 1, time: activity.time || "", title: activity.title || "" });
        }
      });
    });
    return out;
  }, [itinerary]);

  // A string key, so the lookup only re-runs when the actual places change.
  const labelsKey = useMemo(() => [...new Set(visits.map((v) => v.label))].join("\n"), [visits]);
  const requestKey = `${destination}\n${labelsKey}`;
  const loading = fetched.key !== requestKey;

  // Coordinates come from the server, which checks Wikipedia + OpenStreetMap
  // and caches every place — see server/controllers/geoController.js.
  useEffect(() => {
    if (!destination) return;
    let cancelled = false;
    const places = labelsKey ? labelsKey.split("\n") : [];
    getPins(destination, places)
      .then((data) => !cancelled && setFetched({ key: requestKey, data }))
      .catch(() => !cancelled && setFetched({ key: requestKey, error: true }));
    return () => {
      cancelled = true;
    };
  }, [destination, labelsKey, requestKey]);

  // One marker per spot; a place visited on two days gets one pin listing both.
  const markers = useMemo(() => {
    const pins = fetched.data?.pins || {};
    const byPoint = new globalThis.Map();
    for (const v of visits) {
      const pin = pins[v.label];
      if (!pin) continue;
      const key = `${pin.lat.toFixed(4)},${pin.lng.toFixed(4)}`;
      if (!byPoint.has(key)) byPoint.set(key, { key, lat: pin.lat, lng: pin.lng, label: v.label, visits: [] });
      byPoint.get(key).visits.push(v);
    }
    return [...byPoint.values()];
  }, [fetched.data, visits]);

  const pinnedDays = [...new Set(markers.flatMap((m) => m.visits.map((v) => v.day)))].sort((a, b) => a - b);
  const dayFilter = pinnedDays.includes(activeDay) ? activeDay : null;
  const markersFor = (day) => (day ? markers.filter((m) => m.visits.some((v) => v.day === day)) : markers);
  const shown = markersFor(dayFilter);
  const selected = shown.find((m) => m.key === selectedKey) || null;

  const placeCount = labelsKey ? labelsKey.split("\n").length : 0;
  const pinnedCount = labelsKey ? labelsKey.split("\n").filter((l) => fetched.data?.pins?.[l]).length : 0;

  const focusDay = (day) => {
    setActiveDay(day);
    setSelectedKey(null);
    const map = mapRef.current;
    if (!map) return;
    const camera = cameraFor(markersFor(day), fetched.data?.center);
    if (camera.bounds) map.fitBounds(camera.bounds, { ...camera.fitBoundsOptions, duration: 800 });
    else map.flyTo({ center: [camera.longitude, camera.latitude], zoom: camera.zoom, duration: 800 });
  };

  return (
    <div>
      {!loading && pinnedDays.length > 1 && (
        <div className="flex flex-wrap gap-1.5 p-3 border-b border-cream-300">
          <DayChip active={dayFilter === null} onClick={() => focusDay(null)}>
            All days
          </DayChip>
          {pinnedDays.map((d) => (
            <DayChip key={d} active={dayFilter === d} onClick={() => focusDay(d)} color={dayColor(d)}>
              Day {d}
            </DayChip>
          ))}
        </div>
      )}

      <div className="relative w-full" style={{ height: "450px" }}>
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-cream-100 text-ink-500 text-sm">
            Finding your places on the map…
          </div>
        ) : fetched.error ? (
          <div className="w-full h-full flex items-center justify-center bg-cream-100 text-ink-500 text-sm px-6 text-center">
            Couldn't load the map pins right now. Try reloading the page.
          </div>
        ) : (
          <Map
            ref={mapRef}
            initialViewState={cameraFor(markers, fetched.data?.center)}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: "100%", height: "100%" }}
          >
            {shown.map((marker) => (
              <Marker
                key={marker.key}
                longitude={marker.lng}
                latitude={marker.lat}
                anchor="left"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedKey(marker.key);
                }}
              >
                {/* Labeled pin: colored dot + place name. The map stays light in
                    dark mode, so the label uses a literal white the theme won't flip. */}
                <div className="flex items-center gap-1 cursor-pointer group">
                  <span
                    className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-md shrink-0"
                    style={{ backgroundColor: dayColor(dayFilter || marker.visits[0].day) }}
                  />
                  <span className="text-[10px] font-semibold text-gray-800 bg-white/90 group-hover:bg-[#fff] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap max-w-[150px] truncate transition">
                    {marker.label}
                  </span>
                </div>
              </Marker>
            ))}

            {selected && (
              <Popup
                longitude={selected.lng}
                latitude={selected.lat}
                anchor="top"
                onClose={() => setSelectedKey(null)}
                closeOnClick={false}
                focusAfterOpen={false}
              >
                <div className="text-xs p-1 text-gray-800 max-w-[220px]">
                  <p className="font-semibold">{selected.label}</p>
                  {selected.visits.map((v, i) => (
                    <p key={i} className="text-gray-500">
                      Day {v.day}
                      {v.time && ` · ${v.time}`}
                      {v.title && v.title !== selected.label && ` — ${v.title}`}
                    </p>
                  ))}
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

      {!loading && !fetched.error && placeCount > 0 && pinnedCount < placeCount && (
        <p className="px-4 py-2.5 text-xs text-ink-500 border-t border-cream-300">
          {pinnedCount} of {placeCount} places pinned.{" "}
          {fetched.data?.incomplete
            ? "Some couldn't be checked just now — reload to try again."
            : "The rest couldn't be located precisely, so they're left off rather than guessed."}
        </p>
      )}
    </div>
  );
}

function DayChip({ active, onClick, color, children }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition ${
        active ? "bg-forest-600 text-white shadow-soft" : "bg-cream-100 text-ink-700 hover:bg-cream-200"
      }`}
    >
      {color && (
        <span
          className="w-2.5 h-2.5 rounded-full border border-white/70"
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </button>
  );
}
