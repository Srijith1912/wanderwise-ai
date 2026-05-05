const destinations = require("../data/destinations");
const TrendingCache = require("../models/TrendingCache");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TRENDING_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const getDestinations = (req, res) => {
  try {
    const { continent, budget, vibe } = req.query;

    let filtered = [...destinations];

    if (continent) {
      filtered = filtered.filter(
        (d) => d.continent.toLowerCase() === continent.toLowerCase(),
      );
    }
    if (budget) {
      filtered = filtered.filter(
        (d) => d.budget.toLowerCase() === budget.toLowerCase(),
      );
    }
    if (vibe) {
      filtered = filtered.filter(
        (d) => d.vibe.toLowerCase() === vibe.toLowerCase(),
      );
    }

    res.json({ destinations: filtered });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch destinations" });
  }
};

const generateTrendingFromAI = async () => {
  const prompt = `List 8 currently popular and trending travel destinations for the upcoming season.
Pick a diverse mix across continents, budgets, and vibes. Avoid the same overdone picks every time.
Return ONLY this JSON:
{
  "destinations": [
    {
      "name": "City or Region",
      "country": "Country",
      "continent": "Africa|Asia|Europe|North America|South America|Oceania",
      "vibe": "adventurous|peaceful|relaxed",
      "budget": "budget|mid|high",
      "description": "1-2 sentence description (40-80 words) capturing what makes it special right now",
      "highlights": ["highlight 1", "highlight 2", "highlight 3"]
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.9,
    response_format: { type: "json_object" },
    max_tokens: 1800,
  });

  const parsed = JSON.parse(response.choices[0].message.content);
  const list = Array.isArray(parsed.destinations) ? parsed.destinations : [];

  return list.slice(0, 8).map((d, i) => ({
    id: `ai-${i + 1}`,
    name: d.name,
    country: d.country,
    continent: d.continent,
    vibe: (d.vibe || "relaxed").toLowerCase(),
    budget: (d.budget || "mid").toLowerCase(),
    description: d.description || "",
    highlights: Array.isArray(d.highlights) ? d.highlights.slice(0, 4) : [],
    imageQuery: `${d.name} ${d.country}`,
    isTrending: true,
  }));
};

const getTrending = async (req, res) => {
  try {
    const cached = await TrendingCache.findOne({ key: "global" });
    // Invalidate caches generated before we switched from broken source.unsplash.com URLs
    // to imageQuery-driven Wikipedia photos. New entries have imageQuery; old ones don't.
    const cacheHasNewSchema =
      cached?.destinations?.length > 0 && cached.destinations.every((d) => d && d.imageQuery);
    const fresh =
      cached &&
      cacheHasNewSchema &&
      Date.now() - new Date(cached.generatedAt).getTime() < TRENDING_TTL_MS;

    if (fresh) {
      return res.json({
        destinations: cached.destinations,
        generatedAt: cached.generatedAt,
        cached: true,
      });
    }

    // Stale or missing — regenerate. If OpenAI fails, fall back to old cache (or empty array).
    let destinations = [];
    try {
      destinations = await generateTrendingFromAI();
    } catch (err) {
      console.error("trending AI generation failed:", err.message);
      if (cached) {
        return res.json({
          destinations: cached.destinations,
          generatedAt: cached.generatedAt,
          cached: true,
          stale: true,
        });
      }
      return res.json({ destinations: [], generatedAt: null, cached: false });
    }

    const updated = await TrendingCache.findOneAndUpdate(
      { key: "global" },
      { key: "global", generatedAt: new Date(), destinations },
      { upsert: true, new: true },
    );

    res.json({
      destinations: updated.destinations,
      generatedAt: updated.generatedAt,
      cached: false,
    });
  } catch (err) {
    console.error("getTrending error:", err);
    res.status(500).json({ message: "Failed to fetch trending destinations" });
  }
};

module.exports = { getDestinations, getTrending };
