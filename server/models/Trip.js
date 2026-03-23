const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "My Trip",
    },
    destination: {
      type: String,
      required: true,
    },
    budget: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    interests: {
      type: [String],
      default: [],
    },
    travelStyle: {
      type: String,
      default: "balanced",
    },
    generatedItinerary: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Trip", tripSchema);
