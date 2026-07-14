// Rotating editorial copy — a fresh line every page load so the site never
// greets you the same way twice. Pick with pickOne() inside a useMemo so the
// choice is stable for the lifetime of the page, then re-rolls on next visit.

export const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---- Explore hero headlines ----
// Shape: { before, accent, after } — `accent` renders as the italic gold word.
export const HERO_HEADLINES = [
  { before: "Where will the ", accent: "wind", after: " take you next?" },
  { before: "The world is wide — ", accent: "wander", after: " it." },
  { before: "Somewhere out there has your ", accent: "name", after: " on it." },
  { before: "Every great story starts with a ", accent: "ticket", after: "." },
  { before: "Go where the map turns ", accent: "golden", after: "." },
  { before: "Pack light. Dream ", accent: "heavy", after: "." },
  { before: "Your next favorite place is still a ", accent: "stranger", after: "." },
  { before: "Chase the sun to a new ", accent: "horizon", after: "." },
  { before: "Not all who wander are lost — some are just ", accent: "early", after: "." },
  { before: "Trade your routine for a ", accent: "runway", after: "." },
];

export const HERO_SUBTITLES = [
  "Itineraries crafted in seconds, destinations worth the detour, and a feed full of travelers who've already been.",
  "Tell us where (or don't) — we'll sketch the trip, you make it yours.",
  "Curated places, honest plans, and a community that's already halfway there.",
  "From weekend escapes to once-in-a-lifetime treks — planned in the time it takes to daydream.",
  "Less time planning, more time packing. We handle the boring part.",
  "Real places, real travelers, and an itinerary that actually fits you.",
];

// ---- Feed headlines ----
export const FEED_HEADLINES = [
  { before: "Stories from the ", accent: "road" },
  { before: "Postcards from ", accent: "everywhere" },
  { before: "Tales worth the ", accent: "jet lag" },
  { before: "Souvenirs, but make them ", accent: "stories" },
  { before: "The world, ", accent: "firsthand" },
  { before: "Dispatches from the ", accent: "detour" },
  { before: "Moments that made the ", accent: "trip" },
  { before: "Wander now, ", accent: "brag later" },
  { before: "Between departures and ", accent: "arrivals" },
  { before: "Proof the world is ", accent: "worth it" },
];

export const FEED_SUBTITLES = [
  "What travelers are loving right now.",
  "Fresh from backpacks and boarding passes.",
  "See where everyone's been sneaking off to.",
  "Real trips, real photos, zero brochures.",
  "The good, the bad, and the beautifully unplanned.",
  "Straight from the people who actually went.",
];

// ---- Composer prompts (feed) — {name} is replaced with the user's first name ----
export const COMPOSER_PROMPTS = [
  "Been somewhere lately, {name}? Tell the feed…",
  "Got a story from the road, {name}?",
  "Where did you wake up last week, {name}?",
  "Share the view, {name} — someone needs the inspiration…",
  "What did the trip teach you, {name}?",
  "Drop a hidden gem, {name} — we won't tell everyone…",
  "That photo in your camera roll, {name}? Post it.",
  "Best bite you had on the road, {name}?",
  "Somewhere still on your mind, {name}?",
  "Tell us about the detour, {name} — those are the best parts…",
];

export const fillName = (template, name) =>
  template.replaceAll("{name}", name || "traveler");

// ---- Rotating hero photos (landing / login / signup) ----
// Direct images.unsplash.com asset URLs (the search endpoint is deprecated; these
// specific assets are stable). A different scenic shot greets you each visit.
export const HERO_PHOTOS = [
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e", // mountain road
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470", // mountain lake
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1", // green valley train
  "https://images.unsplash.com/photo-1502920917128-1aa500764cbd", // sunset palms
  "https://images.unsplash.com/photo-1488085061387-422e29b40080", // road trip
  "https://images.unsplash.com/photo-1519681393784-d120267933ba", // starry mountains
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", // tropical beach
  "https://images.unsplash.com/photo-1454496522488-7a8e488e8606", // misty peaks
  "https://images.unsplash.com/photo-1444723121867-7a241cacace9", // city dusk
  "https://images.unsplash.com/photo-1439066615861-d1af74d74000", // foggy forest
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05", // alpine fog
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716", // waterfall bridge
  "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5", // golden field
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d", // forest path
  "https://images.unsplash.com/photo-1426604966848-d7adac402bff", // green valley
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee", // summit sunset
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e", // lake cabin
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e", // rolling hills
  "https://images.unsplash.com/photo-1505765050516-f72dcac9c60e", // terraced green
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e", // mirror lake
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34", // paris
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963", // amalfi coast
  "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9", // venice canal
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da", // taj mahal
];

// A known-good shot to fall back to if a chosen photo ever fails to load.
export const HERO_FALLBACK = "https://images.unsplash.com/photo-1469474968028-56623f02e42e";

// Full URL at a given width (hero wants wider than the auth split-screen).
export const heroPhoto = (url, width = 1600) => `${url}?w=${width}&q=80&auto=format&fit=crop`;
