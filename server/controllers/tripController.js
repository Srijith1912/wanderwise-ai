const Trip = require("../models/Trip");

// @desc    Generate a trip itinerary using AI
// @route   POST /api/trips/generate
// @access  Private
const generateTrip = async (req, res) => {
  try {
    const { destination, budget, duration, interests, travelStyle } = req.body;

    // Validate required fields
    if (!destination || !budget || !duration) {
      return res.status(400).json({
        message: "Destination, budget, and duration are required",
      });
    }

    // Placeholder response until OpenAI is integrated in the next session
    const placeholderItinerary = {
      destination,
      duration,
      summary: `A ${duration}-day ${travelStyle || "balanced"} trip to ${destination} on a ${budget} budget.`,
      days: Array.from({ length: Number(duration) }, (_, i) => ({
        day: i + 1,
        theme: `Day ${i + 1} in ${destination}`,
        activities: [
          { time: "Morning", description: "Explore the local area" },
          { time: "Afternoon", description: "Visit key attractions" },
          { time: "Evening", description: "Local dining experience" },
        ],
      })),
    };

    res.status(200).json({
      message: "Trip generated successfully",
      itinerary: placeholderItinerary,
    });
  } catch (error) {
    console.error("generateTrip error:", error);
    res.status(500).json({ message: "Server error generating trip" });
  }
};

// @desc    Save a generated trip to the database
// @route   POST /api/trips/save
// @access  Private
const saveTrip = async (req, res) => {
  try {
    const {
      title,
      destination,
      budget,
      duration,
      interests,
      travelStyle,
      generatedItinerary,
    } = req.body;

    const trip = await Trip.create({
      userId: req.user.id,
      title: title || `Trip to ${destination}`,
      destination,
      budget,
      duration,
      interests: interests || [],
      travelStyle: travelStyle || "balanced",
      generatedItinerary,
    });

    res.status(201).json({ message: "Trip saved successfully", trip });
  } catch (error) {
    console.error("saveTrip error:", error);
    res.status(500).json({ message: "Server error saving trip" });
  }
};

// @desc    Get all trips for the logged-in user
// @route   GET /api/trips
// @access  Private
const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ trips });
  } catch (error) {
    console.error("getTrips error:", error);
    res.status(500).json({ message: "Server error fetching trips" });
  }
};

// @desc    Get a single trip by ID
// @route   GET /api/trips/:id
// @access  Private
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Make sure the trip belongs to the logged-in user
    if (trip.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this trip" });
    }

    res.status(200).json({ trip });
  } catch (error) {
    console.error("getTripById error:", error);
    res.status(500).json({ message: "Server error fetching trip" });
  }
};

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (trip.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this trip" });
    }

    await trip.deleteOne();
    res.status(200).json({ message: "Trip deleted successfully" });
  } catch (error) {
    console.error("deleteTrip error:", error);
    res.status(500).json({ message: "Server error deleting trip" });
  }
};

module.exports = { generateTrip, saveTrip, getTrips, getTripById, deleteTrip };
