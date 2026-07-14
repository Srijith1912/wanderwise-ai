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
