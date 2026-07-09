import { useEffect, useState } from "react";
import { getWikiPhoto } from "../utils/wikiPhoto";
import { getPexelsPhoto } from "../utils/photo";

// Curated fallback set — direct images.unsplash.com asset URLs (these still work,
// unlike the deprecated source.unsplash.com search endpoint).
const FALLBACKS = [
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80", // mountain road
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", // beach
  "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80", // city skyline
  "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80", // sunset palms
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80", // travel passport
];

const fallbackFor = (seed) => {
  if (!seed) return FALLBACKS[0];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return FALLBACKS[h % FALLBACKS.length];
};

// SmartImage: prefers a direct `src` if given (curated photos), otherwise resolves
// `query` via Wikipedia. Falls back to a curated travel image if both fail.
export default function SmartImage({
  src,
  query,
  alt,
  className,
  size = 600,
  onError,
  ...rest
}) {
  const fallback = fallbackFor(query || src || alt);
  const [current, setCurrent] = useState(src || fallback);

  useEffect(() => {
    setCurrent(src || fallback);
    if (src) return; // direct URL wins; skip lookups
    if (!query) return;
    let active = true;
    // Prefer Pexels (attractive travel photography); fall back to Wikipedia
    // (great for landmarks) and finally the curated fallback already set.
    (async () => {
      const pexels = await getPexelsPhoto(query, size);
      if (!active) return;
      if (pexels) {
        setCurrent(pexels);
        return;
      }
      const wiki = await getWikiPhoto(query, size);
      if (active && wiki) setCurrent(wiki);
    })();
    return () => {
      active = false;
    };
  }, [src, query, size, fallback]);

  return (
    <img
      src={current}
      alt={alt || query || ""}
      className={className}
      referrerPolicy="no-referrer"
      onError={(e) => {
        if (current !== fallback) setCurrent(fallback);
        if (onError) onError(e);
      }}
      {...rest}
    />
  );
}
