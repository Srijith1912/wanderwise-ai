// Coordinates for the trip map's place pins.
//
// The map used to geocode each place with Mapbox in the browser, but Mapbox is
// weak at landmarks outside the US/Europe: in testing it put only 9 of 27
// well-known places within 1 km, often returning the city itself or a homonym
// hundreds of km away. Each place is now resolved here in two steps:
//   1. Wikipedia — fast, keyless, exact coordinates on nearly every landmark
//      article. Only accepted when the article title actually matches the place.
//   2. Nominatim (OpenStreetMap) — fallback for restaurants, markets and other
//      venues without an article. Its policy is max 1 request/second, an
//      identifying User-Agent, and caching results; all three are handled here.
// Any result beyond day-trip range of the destination is dropped — better no
// pin than a wrong one. Results are cached permanently in Mongo (GeoCache).

const GeoCache = require("../models/GeoCache");

const USER_AGENT = "Nostosa/1.0 (+https://wanderwise-ai-psi.vercel.app)";
const MAX_PLACES = 40;
const MISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // retry places we couldn't find after a week
const NOMINATIM_GAP_MS = 1100;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Name matching
// ---------------------------------------------------------------------------

const STOPWORDS = new Set([
  "the", "a", "an", "of", "at", "in", "on", "and", "to", "for", "by", "with",
  "de", "la", "le", "les", "el", "del", "di", "da", "du", "des",
]);

const stem = (t) => (t.length > 3 && t.endsWith("s") ? t.slice(0, -1) : t);

// Words found in lots of names. They count toward a match but can't make one on
// their own — "Temple" alone shouldn't match any temple in the city.
const GENERIC = new Set(
  [
    "temple", "shrine", "museum", "park", "market", "tower", "church", "cathedral", "basilica",
    "mosque", "palace", "garden", "beach", "square", "plaza", "street", "road", "bridge", "castle",
    "fort", "lake", "river", "mountain", "mount", "hill", "national", "old", "town", "city",
    "center", "centre", "district", "quarter", "art", "gallery", "house", "hall", "station", "bay",
    "island", "view", "viewpoint", "point", "forest", "falls", "waterfall", "cave", "harbor",
    "harbour", "port", "monument", "memorial", "library", "theatre", "theater", "opera", "zoo",
    "aquarium", "gate", "wall", "historic", "central", "food", "night", "local", "cafe",
    "restaurant", "bar", "visit", "explore", "tour", "walk", "stroll", "trip", "day", "morning",
    "afternoon", "evening", "lunch", "dinner", "breakfast", "sunset", "sunrise",
    // the same words in the languages place names often keep
    "musee", "museo", "museu", "jardin", "jardim", "parc", "parque", "piazza", "praca", "place",
    "chateau", "palais", "palazzo", "iglesia", "eglise", "kirche", "dom", "jinja", "jingu",
    "taisha", "dera", "ji", "pura", "wat",
  ].map(stem),
);

// "Sensō-ji Temple" -> "senso ji temple"
const normalize = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const tokens = (s) =>
  normalize(s)
    .split(" ")
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map(stem);

// The words that identify a place, minus the destination's own name
// ("Lisbon Cathedral" in Lisbon -> ["cathedral"]).
const placeWords = (place, destWords) => [...new Set(tokens(place))].filter((t) => !destWords.has(t));

// Does a candidate's name refer to the place we want? Most of the distinctive
// words must be there ("High Line" must not match "High Bridge"); generic ones
// may be missing ("Louvre Museum" matches the article "Louvre").
// Returns null when the candidate has no Latin-script words to compare (a name
// only in Japanese, say) — the caller decides whether to trust it then.
function namesMatch(want, candidateName) {
  const words = new Set(tokens(candidateName));
  if (words.size === 0) return null;
  // Spacing varies between sources ("Sensoji" vs "Sensō-ji"), so a longer word
  // also counts if it appears in the name with the spaces squeezed out.
  const squeezed = normalize(candidateName).replace(/ /g, "");
  const has = (t) => words.has(t) || (t.length >= 4 && squeezed.includes(t));

  if (want.filter(has).length / want.length < 0.5) return false;
  const distinctive = want.filter((t) => !GENERIC.has(t));
  if (distinctive.length === 0) return want.every(has);
  return distinctive.filter(has).length / distinctive.length >= 0.6;
}

// ---------------------------------------------------------------------------
// Distance
// ---------------------------------------------------------------------------

function distanceKm(a, b) {
  const R = 6371;
  const r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r;
  const dLng = (b.lng - a.lng) * r;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Day-trip range: at least 300 km (Paris -> Mont-Saint-Michel), more for big
// destinations — a country-level trip like "Japan" spans its whole bounding box.
function rangeKm(dest) {
  if (!dest.bbox) return 300;
  const [minLng, minLat, maxLng, maxLat] = dest.bbox;
  const halfDiagonal = distanceKm({ lat: minLat, lng: minLng }, { lat: maxLat, lng: maxLng }) / 2;
  return Math.max(300, halfDiagonal * 1.5);
}

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

// Nominatim allows one request per second across the whole app, so every call
// goes through this queue.
let nominatimQueue = Promise.resolve();
let lastNominatimAt = 0;

function nominatim(params) {
  const run = async () => {
    const wait = lastNominatimAt + NOMINATIM_GAP_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastNominatimAt = Date.now();
    const qs = new URLSearchParams({ format: "jsonv2", "accept-language": "en", ...params });
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${qs}`, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    return res.json();
  };
  const result = nominatimQueue.then(run);
  nominatimQueue = result.catch(() => {});
  return result;
}

async function lookupDestination(destination) {
  const [r] = await nominatim({ q: destination, limit: "1" });
  if (!r) return { found: false };
  const [minLat, maxLat, minLng, maxLng] = r.boundingbox.map(Number);
  return {
    found: true,
    lat: Number(r.lat),
    lng: Number(r.lon),
    name: r.name,
    source: "nominatim",
    bbox: [minLng, minLat, maxLng, maxLat],
  };
}

async function fromWikipedia(place, destination, want, dest) {
  const qs = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `${place} ${destination.split(",")[0]}`,
    gsrlimit: "5",
    prop: "coordinates",
    colimit: "max",
  });
  const res = await fetch(`https://en.wikipedia.org/w/api.php?${qs}`, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Wikipedia ${res.status}`);
  const data = await res.json();

  const pages = Object.values(data.query?.pages || {}).sort((a, b) => a.index - b.index);
  for (const page of pages) {
    const c = page.coordinates?.[0];
    if (!c) continue;
    const point = { lat: c.lat, lng: c.lon };
    if (namesMatch(want, page.title) === true && distanceKm(dest, point) <= dest.rangeKm) {
      return { found: true, ...point, name: page.title, source: "wikipedia" };
    }
  }
  return { found: false };
}

async function fromNominatim(place, destination, want, dest) {
  // Second attempt drops the destination text and searches inside its bounding
  // box instead, for when the text itself misleads (Vatican Museums isn't "in Italy").
  const attempts = [{ q: `${place}, ${destination}` }];
  if (dest.bbox) attempts.push({ q: place, viewbox: dest.bbox.join(","), bounded: "1" });

  for (const params of attempts) {
    const results = await nominatim({ ...params, limit: "3" });
    for (const r of results) {
      const point = { lat: Number(r.lat), lng: Number(r.lon) };
      const name = r.name || r.display_name?.split(",")[0] || "";
      if (namesMatch(want, name) !== false && distanceKm(dest, point) <= dest.rangeKm) {
        return { found: true, ...point, name, source: "nominatim" };
      }
    }
  }
  return { found: false };
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

const destKey = (destination) => `dest:${normalize(destination)}`;
const placeKey = (place, destination) => `place:${normalize(place)}|${normalize(destination)}`;

async function readCache(keys) {
  try {
    const docs = await GeoCache.find({ key: { $in: keys } }).lean();
    return new Map(docs.map((d) => [d.key, d]));
  } catch (error) {
    console.error("GeoCache read error:", error.message);
    return new Map();
  }
}

// Only definitive answers are cached; a timeout or HTTP error never is.
function writeCache(key, result) {
  const fields = { found: result.found };
  for (const f of ["lat", "lng", "name", "source", "bbox"]) {
    if (result[f] !== undefined) fields[f] = result[f];
  }
  const update = result.found
    ? { $set: fields, $unset: { expiresAt: 1 } }
    : { $set: { ...fields, expiresAt: new Date(Date.now() + MISS_TTL_MS) } };
  GeoCache.updateOne({ key }, update, { upsert: true }).catch((error) =>
    console.error("GeoCache write error:", error.message),
  );
}

const toPin = ({ lat, lng, name, source }) => ({ lat, lng, name, source });

// Run `fn` over `items`, at most `limit` at a time.
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

// @desc    Coordinates for the named places on a trip, for map pins
// @route   POST /api/geo/pins   body: { destination, places: [String] }
// @access  Private
const getPins = async (req, res) => {
  try {
    const destination = String(req.body?.destination || "").trim().slice(0, 120);
    if (!destination) return res.status(400).json({ message: "destination is required" });

    const rawPlaces = Array.isArray(req.body?.places) ? req.body.places : [];
    const places = [
      ...new Set(
        rawPlaces
          .filter((p) => typeof p === "string")
          .map((p) => p.trim().slice(0, 120))
          .filter(Boolean),
      ),
    ].slice(0, MAX_PLACES);

    const cached = await readCache([destKey(destination), ...places.map((p) => placeKey(p, destination))]);

    let dest = cached.get(destKey(destination));
    if (!dest) {
      try {
        dest = await lookupDestination(destination);
      } catch (error) {
        console.error("Destination lookup error:", error.message);
        return res.status(503).json({ message: "Map lookup is unavailable right now. Try again shortly." });
      }
      writeCache(destKey(destination), dest);
    }
    // Without a fix on the destination we can't tell a right pin from a wrong one.
    if (!dest.found) return res.status(200).json({ center: null, bbox: null, pins: {} });
    dest = { ...dest, rangeKm: rangeKm(dest) };

    const destWords = new Set(tokens(destination));
    const pins = {};
    const pending = [];
    for (const place of places) {
      const want = placeWords(place, destWords);
      if (want.length === 0) {
        pins[place] = null; // the "place" is just the destination itself
        continue;
      }
      const hit = cached.get(placeKey(place, destination));
      if (hit) pins[place] = hit.found ? toPin(hit) : null;
      else pending.push({ place, want });
    }

    let incomplete = false;
    const settle = (place, result) => {
      if (result.error) {
        incomplete = true;
        return;
      }
      writeCache(placeKey(place, destination), result);
      pins[place] = result.found ? toPin(result) : null;
    };

    // Wikipedia for every uncached place, a few at a time…
    const wiki = await mapLimit(pending, 4, ({ place, want }) =>
      fromWikipedia(place, destination, want, dest).catch((error) => ({ error })),
    );
    // …then Nominatim (queued, 1/sec) for whatever Wikipedia couldn't place.
    const fallbacks = [];
    pending.forEach(({ place, want }, i) => {
      if (wiki[i].found) return settle(place, wiki[i]);
      fallbacks.push(
        fromNominatim(place, destination, want, dest)
          .catch((error) => ({ error }))
          .then((osm) => {
            if (osm.found) settle(place, osm);
            else if (wiki[i].error || osm.error) settle(place, { error: true });
            else settle(place, { found: false });
          }),
      );
    });
    await Promise.all(fallbacks);

    res.status(200).json({
      center: { lat: dest.lat, lng: dest.lng },
      bbox: dest.bbox || null,
      pins,
      incomplete,
    });
  } catch (error) {
    console.error("getPins error:", error);
    res.status(500).json({ message: "Failed to look up places" });
  }
};

module.exports = { getPins };
