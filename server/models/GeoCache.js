const mongoose = require("mongoose");

// Permanent cache of place lookups for the trip map. A landmark's coordinates
// don't change, so each place is looked up once for every user — which is also
// what Nominatim's usage policy asks for. Misses are cached too, but expire
// (via the TTL index on `expiresAt`) so they get retried later.
const geoCacheSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // "place:<name>|<destination>" or "dest:<destination>"
    found: { type: Boolean, required: true },
    lat: Number,
    lng: Number,
    name: String, // what the source called it, e.g. "Sensō-ji"
    source: String, // "wikipedia" | "nominatim"
    bbox: { type: [Number], default: undefined }, // destinations only: [minLng, minLat, maxLng, maxLat]
    expiresAt: { type: Date, default: undefined },
  },
  { timestamps: true },
);

geoCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("GeoCache", geoCacheSchema);
