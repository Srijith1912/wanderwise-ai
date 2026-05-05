// Fetches a photo URL for a search query via the public Wikipedia API.
// No API key. CORS allowed via origin=*. Returns the article's pageimage thumbnail.
//
// Why Wikipedia: Unsplash's Source API (source.unsplash.com) was deprecated in 2024,
// so we needed a free, key-less alternative. Wikipedia covers landmarks/cities very well.

const memoryCache = new Map(); // query -> url | null
const inflight = new Map();    // query -> Promise

const normalize = (q) => q.trim().toLowerCase();

export async function getWikiPhoto(query, size = 600) {
  if (!query || !query.trim()) return null;
  const key = normalize(query);
  if (memoryCache.has(key)) return memoryCache.get(key);
  if (inflight.has(key)) return inflight.get(key);

  // Wikipedia's "query+pageimages with generator=search" gets the most relevant article
  // AND its thumbnail in a single round trip.
  const url =
    `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&` +
    `pithumbsize=${size}&pilicense=any&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&origin=*`;

  const promise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const pages = data?.query?.pages;
      if (!pages) return null;
      const page = Object.values(pages)[0];
      return page?.thumbnail?.source || null;
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
