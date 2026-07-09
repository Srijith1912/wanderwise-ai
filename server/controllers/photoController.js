// Photo lookup via Pexels — key stays server-side (PEXELS_API_KEY).
// Public (no auth) because the Explore landing uses photos while logged out.
// Cached in-memory so repeated queries don't burn the Pexels quota.

const PEXELS_KEY = process.env.PEXELS_API_KEY;
const cache = new Map(); // `${query}|${bucket}` -> url | null

// @desc    Best landscape photo URL for a search query
// @route   GET /api/photos?query=Eiffel Tower&size=1200
// @access  Public
const getPhoto = async (req, res) => {
  try {
    const query = (req.query.query || "").trim();
    const size = Number(req.query.size) || 600;
    if (!query) return res.status(400).json({ message: "query is required" });

    if (!PEXELS_KEY) return res.status(200).json({ available: false, url: null });

    const bucket = size >= 1000 ? "lg" : "md";
    const cacheKey = `${query.toLowerCase()}|${bucket}`;
    if (cache.has(cacheKey)) {
      return res.status(200).json({ available: true, url: cache.get(cacheKey) });
    }

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
    const r = await fetch(url, { headers: { Authorization: PEXELS_KEY } });
    if (!r.ok) {
      return res.status(200).json({ available: true, url: null });
    }
    const data = await r.json();
    const photo = data.photos?.[0];
    const src = photo
      ? bucket === "lg"
        ? photo.src.large2x || photo.src.large
        : photo.src.large || photo.src.landscape
      : null;

    cache.set(cacheKey, src || null);
    res.status(200).json({ available: true, url: src || null });
  } catch (error) {
    console.error("getPhoto error:", error);
    res.status(200).json({ available: true, url: null });
  }
};

module.exports = { getPhoto };
