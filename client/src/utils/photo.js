// Fetches an attractive photo URL for a query via our Pexels proxy (/api/photos).
// Falls back to null so callers can try Wikipedia / a curated image instead.
// Cached in-memory + inflight-deduped, mirroring wikiPhoto.

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/photos`
  : "/api/photos";

const memoryCache = new Map(); // `${query}|${bucket}` -> url | null
const inflight = new Map();

export async function getPexelsPhoto(query, size = 600) {
  if (!query || !query.trim()) return null;
  const bucket = size >= 1000 ? "lg" : "md";
  const key = `${query.trim().toLowerCase()}|${bucket}`;
  if (memoryCache.has(key)) return memoryCache.get(key);
  if (inflight.has(key)) return inflight.get(key);

  const promise = (async () => {
    try {
      const res = await fetch(`${BASE}?query=${encodeURIComponent(query)}&size=${size}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.url || null;
    } catch {
      return null;
    }
  })();

  inflight.set(key, promise);
  const result = await promise;
  memoryCache.set(key, result);
  inflight.delete(key);
  return result;
}
