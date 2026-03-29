const Trip = require("../models/Trip");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// @desc    Generate a trip itinerary using AI
// @route   POST /api/trips/generate
// @access  Private
const generateTrip = async (req, res) => {
  try {
    const { destination, budget, duration, interests, travelStyle } = req.body;

    if (!destination || !budget || !duration) {
      return res.status(400).json({
        message: "Destination, budget, and duration are required",
      });
    }

    const prompt = `
You are an expert travel planner. Create a detailed day-by-day travel itinerary based on the following:

Destination: ${destination}
Trip Duration: ${duration} days
Budget Level: ${budget} (options: budget, moderate, luxury)
Interests: ${interests?.join(", ") || "general sightseeing"}
Travel Style: ${travelStyle || "balanced"}

Return ONLY a valid JSON object in exactly this format, no extra text, no markdown:
{
  "destination": "string",
  "duration": number,
  "budget": "string",
  "travelStyle": "string",
  "summary": "2-3 sentence overview of the trip",
  "tips": ["tip1", "tip2", "tip3"],
  "days": [
    {
      "day": 1,
      "theme": "short theme for the day",
      "activities": [
        { "time": "Morning", "title": "Activity name", "description": "What to do and why it's great" },
        { "time": "Afternoon", "title": "Activity name", "description": "What to do and why it's great" },
        { "time": "Evening", "title": "Activity name", "description": "What to do and why it's great" }
      ]
    }
  ]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const rawText = response.choices[0].message.content.trim();
    const itinerary = JSON.parse(rawText);

    res.status(200).json({
      message: "Trip generated successfully",
      itinerary,
    });
  } catch (error) {
    console.error("generateTrip error:", error);

    if (error instanceof SyntaxError) {
      return res
        .status(500)
        .json({ message: "AI returned invalid format, please try again" });
    }

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

// Update trip title
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Ownership check
    if (trip.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Only allow title to be updated for now
    if (req.body.title !== undefined) {
      trip.title = req.body.title;
    }

    const updatedTrip = await trip.save();
    res.json(updatedTrip);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  generateTrip,
  saveTrip,
  getTrips,
  getTripById,
  deleteTrip,
  updateTrip,
};
