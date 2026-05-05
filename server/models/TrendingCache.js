const mongoose = require("mongoose");

// One document holds the current weekly batch of AI-generated trending destinations.
// We upsert into a single doc keyed by `key: 'global'` so reads are O(1).
const trendingCacheSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "global" },
    generatedAt: { type: Date, default: Date.now },
    destinations: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("TrendingCache", trendingCacheSchema);
