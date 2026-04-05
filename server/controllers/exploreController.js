const destinations = require("../data/destinations");

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

module.exports = { getDestinations };
