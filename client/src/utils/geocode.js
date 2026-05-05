// Mapbox geocoding helpers — reuses VITE_MAPBOX_TOKEN.

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Sort places so big cities + countries beat administrative regions / obscure homonyms
// (e.g. "Tokyo" the city beats "Tokyo Prefecture" the region or some hamlet named Tokyo in PNG).
const TYPE_RANK = { place: 0, locality: 1, country: 2, region: 3, district: 4 };
const sortMatches = (features) =>
  [...features].sort((a, b) => {
    const ra = a.relevance ?? 0;
    const rb = b.relevance ?? 0;
    if (rb !== ra) return rb - ra;
    const ta = TYPE_RANK[a.place_type?.[0]] ?? 9;
    const tb = TYPE_RANK[b.place_type?.[0]] ?? 9;
    return ta - tb;
  });

// Live autocomplete suggestions for the destination input. Returns up to 5 candidates.
export async function autocompleteDestinations(query) {
  if (!TOKEN || !query || query.trim().length < 2) return [];
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query,
  )}.json?access_token=${TOKEN}&autocomplete=true&types=place,country,region,locality&limit=8&language=en`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return sortMatches(data.features || [])
      .slice(0, 6)
      .map((f) => ({
        id: f.id,
        name: f.place_name,
        shortName: f.text,
        placeType: f.place_type?.[0] || "place",
      }));
  } catch {
    return [];
  }
}

export async function geocodeDestination(query) {
  if (!TOKEN || !query || !query.trim()) return [];
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query,
  )}.json?access_token=${TOKEN}&types=place,country,region,locality&limit=5&language=en`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return sortMatches(data.features || []).map((f) => ({
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
