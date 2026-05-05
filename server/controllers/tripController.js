const Trip = require("../models/Trip");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Models — cheap one for low-stakes typo correction, stronger one for actual content generation.
const SMART_MODEL = "gpt-4o";
const CHEAP_MODEL = "gpt-4o-mini";

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
        { "time": "Morning", "title": "Activity name", "description": "What to do and why it's great", "imageQuery": "2-4 word photo-search phrase for this exact place/landmark, e.g. 'Eiffel Tower'. Be specific and visual." },
        { "time": "Afternoon", "title": "Activity name", "description": "What to do and why it's great", "imageQuery": "..." },
        { "time": "Evening", "title": "Activity name", "description": "What to do and why it's great", "imageQuery": "..." }
      ]
    }
  ]
}

For imageQuery: pick a recognizable landmark, neighborhood, or visual scene tied to that activity (e.g. "Sensoji Temple", "Shibuya Crossing", "Tsukiji fish market"). Avoid generic words like "restaurant", "lunch", or "museum" alone — combine with the place name when needed.
`;

    const response = await openai.chat.completions.create({
      model: SMART_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
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

// @desc    Suggest real destinations from a possibly-typo'd input.
// @route   POST /api/trips/suggest-destination
// @access  Private
// Uses gpt-4o-mini as a "did you mean" oracle. Cheap (~50–150 output tokens).
const suggestDestination = async (req, res) => {
  try {
    const { input } = req.body;
    if (!input || !input.trim()) {
      return res.status(400).json({ message: "Input is required" });
    }

    const prompt = `The user typed "${input}" as a travel destination. Help validate it.

Reply ONLY with this JSON:
{
  "isRealPlace": boolean,
  "canonical": "string or null — the canonical 'City, Country' if input is real, otherwise null",
  "suggestions": ["City, Country", "City, Country", ...]
}

Rules:
- If the input is a clearly correctly-spelled, well-known travel destination (e.g. "paris", "tokyo", "barcelona", "rome", "bali", "london"), set isRealPlace=true, put the canonical 'City, Country' in canonical, and leave suggestions as []. Do NOT suggest alternatives in this case.
- Only populate suggestions when the input has a clear misspelling or typo (off by 1-3 letters from a famous place — e.g. "tokio" → "Tokyo, Japan"; "barcalona" → "Barcelona, Spain"; "prauge" → "Prague, Czechia"). The misspelled version should NOT itself be a different famous destination.
- Be conservative: if there's any reasonable chance the user typed exactly what they meant, do NOT suggest alternatives.
- If the input is gibberish or not a place, set isRealPlace=false and provide up to 4 best guesses.`;

    const response = await openai.chat.completions.create({
      model: CHEAP_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      response_format: { type: "json_object" },
      max_tokens: 200,
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    res.status(200).json(parsed);
  } catch (error) {
    console.error("suggestDestination error:", error);
    res
      .status(500)
      .json({ message: "Failed to validate destination", suggestions: [] });
  }
};

// @desc    Conversational refinement of an existing (or about-to-be-built) itinerary.
// @route   POST /api/trips/refine
// @access  Private
// Body: { itinerary?, history: [{role, content}], userMessage, context? }
// Returns: { reply, updatedItinerary?, suggestedDestination? }
const refineItinerary = async (req, res) => {
  try {
    const { itinerary, history = [], userMessage, context } = req.body;

    if (!userMessage || !userMessage.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const systemPrompt = itinerary
      ? `You are a friendly AI travel-planning assistant helping the user refine their itinerary.
The user's CURRENT itinerary is:
${JSON.stringify(itinerary, null, 2)}

Reply ONLY in JSON like this:
{
  "reply": "your conversational answer, 1-3 short sentences. If you changed something, briefly say what.",
  "updatedItinerary": null OR the FULL new itinerary object,
  "suggestedDestination": null OR a "City, Country" string,
  "quickReplies": ["short option 1", "short option 2", ...] (2-4 items, optional),
  "imageQueries": ["Eiffel Tower", "Tokyo skyline"] (0-3 short photo-search phrases for places/activities mentioned in your reply, optional)
}

CRITICAL RULES on updatedItinerary:
- WHENEVER the user asks for ANY change to the itinerary — add an activity, remove one, swap days, change pace, replace a meal, add a stop, change theme, "more X", "less Y", "make day N about Z", "add some hidden gems", reorder, retheme, etc. — you MUST return the COMPLETE updated itinerary in "updatedItinerary".
- The returned itinerary must keep the SAME structure: { destination, duration, budget, travelStyle, summary, tips, days: [{day, theme, activities: [{time, title, description}]}] }. Include EVERY field, even ones you didn't change. Do not omit days or activities.
- Set "updatedItinerary" to null ONLY when the user is asking a question or chatting (e.g. "what's the best time to visit?", "tell me about the food").
- If the user wants to switch the trip to a different city entirely, also fill "suggestedDestination" with the canonical "City, Country".

quickReplies: 2-4 short next-step prompts the user might tap (e.g. "Add a food tour", "Make day 2 lighter", "Suggest a hidden gem"). Tailor them to what was just discussed. Omit or set to [] if nothing useful comes to mind.

imageQueries: 0-3 short, photo-search-friendly phrases for the most visual places/activities you mentioned (e.g. "Eiffel Tower at sunset", "Sensoji temple"). Use specific landmark or scene names, 2-4 words each. Omit or set to [] if nothing visual was discussed.

Be concise, warm, and proactive.`
      : `You are a friendly AI travel-planning assistant helping the user pick or describe a destination before generating an itinerary.
${context ? `Context the user has filled so far: ${JSON.stringify(context)}\n` : ""}
Reply ONLY in JSON like this:
{
  "reply": "your conversational answer, 1-3 short sentences",
  "updatedItinerary": null,
  "suggestedDestination": null OR a "City, Country" string,
  "quickReplies": ["short option 1", "short option 2", ...] (2-4 items, optional),
  "imageQueries": ["Eiffel Tower"] (0-3 short photo-search phrases for places mentioned, optional)
}

If the user describes the kind of trip they want or asks for ideas, suggest 1 concrete destination in "suggestedDestination". Always set "updatedItinerary" to null since no itinerary exists yet.

quickReplies: 2-4 short next-step prompts (e.g. "Sure, plan it", "Somewhere else", "Tell me more"). Tailor to context.

imageQueries: 0-3 short, photo-search-friendly phrases for places mentioned (e.g. "Santorini cliffs", "Reykjavik northern lights"). 2-4 words each.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10),
      { role: "user", content: userMessage },
    ];

    const response = await openai.chat.completions.create({
      model: SMART_MODEL,
      messages,
      temperature: 0.7,
      response_format: { type: "json_object" },
      max_tokens: 2500,
    });

    const parsed = JSON.parse(response.choices[0].message.content);

    res.status(200).json({
      reply: parsed.reply || "",
      updatedItinerary: parsed.updatedItinerary || null,
      suggestedDestination: parsed.suggestedDestination || null,
      quickReplies: Array.isArray(parsed.quickReplies) ? parsed.quickReplies.slice(0, 4) : [],
      imageQueries: Array.isArray(parsed.imageQueries) ? parsed.imageQueries.slice(0, 3) : [],
    });
  } catch (error) {
    console.error("refineItinerary error:", error);
    if (error instanceof SyntaxError) {
      return res.status(500).json({
        message: "AI returned invalid format, please try again",
      });
    }
    res
      .status(500)
      .json({ message: "Server error during chat", error: error.message });
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

    if (trip.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

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
  refineItinerary,
  suggestDestination,
};
