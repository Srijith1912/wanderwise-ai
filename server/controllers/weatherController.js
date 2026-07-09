// Weather forecast via OpenWeather. Key stays server-side (OPENWEATHER_API_KEY).
// Free tier gives a 5-day / 3-hour forecast; we aggregate it to one entry per day.

const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY;

// @desc    5-day forecast for a destination city
// @route   GET /api/weather?city=Tokyo, Japan
// @access  Protected
const getWeather = async (req, res) => {
  try {
    const { city } = req.query;
    if (!city || !city.trim()) {
      return res.status(400).json({ message: "city is required" });
    }

    // Not configured yet — respond gracefully so the frontend just hides the widget.
    if (!OPENWEATHER_KEY) {
      return res.status(200).json({ available: false, forecast: [] });
    }

    // OpenWeather matches on city name (ISO country codes, not full names), so
    // use just the first comma-segment: "Tokyo, Japan" -> "Tokyo".
    const cityName = city.split(",")[0].trim();
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
      cityName,
    )}&appid=${OPENWEATHER_KEY}&units=metric`;

    const resp = await fetch(url);
    if (!resp.ok) {
      return res.status(200).json({
        available: true,
        forecast: [],
        city: cityName,
        notFound: resp.status === 404,
      });
    }

    const data = await resp.json();

    // Aggregate the 3-hourly list into per-day min/max + a representative condition.
    const byDay = {};
    for (const item of data.list || []) {
      const [date, time] = item.dt_txt.split(" ");
      if (!byDay[date]) byDay[date] = { temps: [], items: [], noon: null };
      byDay[date].temps.push(item.main.temp);
      byDay[date].items.push(item);
      if (time === "12:00:00") byDay[date].noon = item;
    }

    const forecast = Object.entries(byDay)
      .slice(0, 5)
      .map(([date, d]) => {
        const rep = d.noon || d.items[Math.floor(d.items.length / 2)];
        const w = rep.weather?.[0] || {};
        return {
          date,
          tempMin: Math.round(Math.min(...d.temps)),
          tempMax: Math.round(Math.max(...d.temps)),
          description: w.description || "",
          icon: w.icon || "",
          main: w.main || "",
        };
      });

    res.status(200).json({
      available: true,
      city: data.city?.name || cityName,
      country: data.city?.country || "",
      forecast,
    });
  } catch (error) {
    console.error("getWeather error:", error);
    res.status(500).json({ message: "Server error fetching weather", forecast: [] });
  }
};

module.exports = { getWeather };
