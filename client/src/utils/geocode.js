// Mapbox geocoding helpers — reuses VITE_MAPBOX_TOKEN.

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export async function geocodeDestination(query) {
  if (!TOKEN || !query || !query.trim()) return [];
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query,
  )}.json?access_token=${TOKEN}&types=place,region,country,district,locality&limit=5`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.features || []).map((f) => ({
      name: f.place_name,
      placeType: f.place_type?.[0] || "place",
      relevance: f.relevance ?? 0,
    }));
  } catch {
    return [];
  }
}

// "Real" if Mapbox returns at least one match with relevance > 0.6
// AND the top result type is a place / locality / region / country.
export async function isRealDestination(query) {
  const matches = await geocodeDestination(query);
  if (matches.length === 0) return { valid: false, matches: [] };
  const best = matches[0];
  const valid =
    best.relevance >= 0.6 &&
    ["place", "locality", "region", "country", "district"].includes(best.placeType);
  return { valid, matches };
}
