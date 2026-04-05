const destinations = [
  {
    id: 1,
    name: "Kyoto",
    country: "Japan",
    continent: "Asia",
    vibe: "peaceful",
    budget: "mid",
    description:
      "Ancient temples, bamboo forests, and tea ceremonies. A city where tradition breathes through every street.",
    highlights: [
      "Arashiyama Bamboo Grove",
      "Fushimi Inari Shrine",
      "Gion District",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80",
  },
  {
    id: 2,
    name: "Santorini",
    country: "Greece",
    continent: "Europe",
    vibe: "relaxed",
    budget: "high",
    description:
      "Whitewashed cliffside villages, volcanic beaches, and sunsets that feel almost unreal.",
    highlights: ["Oia Sunset", "Red Beach", "Akrotiri Ruins"],
    imageUrl:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80",
  },
  {
    id: 3,
    name: "Patagonia",
    country: "Argentina & Chile",
    continent: "South America",
    vibe: "adventurous",
    budget: "mid",
    description:
      "Raw wilderness at the end of the world — glaciers, granite peaks, and epic trekking trails.",
    highlights: [
      "Torres del Paine",
      "Perito Moreno Glacier",
      "Los Glaciares NP",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80",
  },
  {
    id: 4,
    name: "Marrakech",
    country: "Morocco",
    continent: "Africa",
    vibe: "adventurous",
    budget: "budget",
    description:
      "A sensory overload in the best way — spice-filled souks, riads, and the electric energy of Jemaa el-Fna.",
    highlights: ["Medina Souks", "Bahia Palace", "Majorelle Garden"],
    imageUrl:
      "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&q=80",
  },
  {
    id: 5,
    name: "New Zealand South Island",
    country: "New Zealand",
    continent: "Oceania",
    vibe: "adventurous",
    budget: "high",
    description:
      "Fjords, glaciers, bungee jumping, and landscapes straight out of Middle Earth.",
    highlights: ["Milford Sound", "Queenstown", "Franz Josef Glacier"],
    imageUrl:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
  },
  {
    id: 6,
    name: "Amalfi Coast",
    country: "Italy",
    continent: "Europe",
    vibe: "relaxed",
    budget: "high",
    description:
      "Dramatic cliffside villages, turquoise coves, limoncello, and la dolce vita at its finest.",
    highlights: ["Positano", "Path of the Gods", "Ravello Gardens"],
    imageUrl:
      "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600&q=80",
  },
  {
    id: 7,
    name: "Bali",
    country: "Indonesia",
    continent: "Asia",
    vibe: "peaceful",
    budget: "budget",
    description:
      "Rice terraces, spiritual temples, surf breaks, and a culture that makes you slow down.",
    highlights: ["Ubud Rice Terraces", "Tanah Lot Temple", "Seminyak Beach"],
    imageUrl:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
  },
  {
    id: 8,
    name: "Iceland",
    country: "Iceland",
    continent: "Europe",
    vibe: "adventurous",
    budget: "high",
    description:
      "Northern lights, volcanic hot springs, waterfalls, and surreal landscapes unlike anywhere else on Earth.",
    highlights: ["Northern Lights", "Golden Circle", "Blue Lagoon"],
    imageUrl:
      "https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=600&q=80",
  },
  {
    id: 9,
    name: "Cape Town",
    country: "South Africa",
    continent: "Africa",
    vibe: "adventurous",
    budget: "mid",
    description:
      "Mountain meets ocean — incredible food, wildlife day trips, and Table Mountain looming over everything.",
    highlights: ["Table Mountain", "Cape Point", "Boulders Beach Penguins"],
    imageUrl:
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80",
  },
  {
    id: 10,
    name: "Banff",
    country: "Canada",
    continent: "North America",
    vibe: "adventurous",
    budget: "mid",
    description:
      "Turquoise glacial lakes, snow-capped Rockies, and wildlife around every corner.",
    highlights: ["Lake Louise", "Moraine Lake", "Icefields Parkway"],
    imageUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
  },
  {
    id: 11,
    name: "Lisbon",
    country: "Portugal",
    continent: "Europe",
    vibe: "relaxed",
    budget: "budget",
    description:
      "Sun-soaked tiles, Fado music drifting from alleyways, and one of Europe's most underrated food scenes.",
    highlights: ["Alfama District", "Belém Tower", "Time Out Market"],
    imageUrl:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=80",
  },
  {
    id: 12,
    name: "Maldives",
    country: "Maldives",
    continent: "Asia",
    vibe: "relaxed",
    budget: "high",
    description:
      "Overwater bungalows, crystal lagoons, and the clearest water you'll ever see.",
    highlights: [
      "Overwater Villas",
      "Snorkeling Reefs",
      "Bioluminescent Beach",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80",
  },
  {
    id: 13,
    name: "Colombia",
    country: "Colombia",
    continent: "South America",
    vibe: "adventurous",
    budget: "budget",
    description:
      "Colorful colonial cities, coffee region highlands, and a warmth and energy that gets under your skin.",
    highlights: ["Cartagena Old City", "Coffee Region", "Lost City Trek"],
    imageUrl:
      "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=600&q=80",
  },
  {
    id: 14,
    name: "Prague",
    country: "Czech Republic",
    continent: "Europe",
    vibe: "peaceful",
    budget: "budget",
    description:
      "Fairy-tale spires, cobbled squares, and one of Europe's best-preserved medieval city centers.",
    highlights: ["Charles Bridge", "Old Town Square", "Prague Castle"],
    imageUrl:
      "https://images.unsplash.com/photo-1541849546-216549ae216d?w=600&q=80",
  },
  {
    id: 15,
    name: "Vietnam",
    country: "Vietnam",
    continent: "Asia",
    vibe: "adventurous",
    budget: "budget",
    description:
      "Limestone karsts, street food at every corner, ancient towns, and a journey through breathtaking landscapes.",
    highlights: ["Ha Long Bay", "Hoi An Old Town", "Phong Nha Caves"],
    imageUrl:
      "https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80",
  },
  {
    id: 16,
    name: "Tuscany",
    country: "Italy",
    continent: "Europe",
    vibe: "relaxed",
    budget: "mid",
    description:
      "Rolling vineyards, Renaissance art, hilltop villages, and pasta that ruins all other pasta forever.",
    highlights: [
      "Florence Duomo",
      "Siena Piazza del Campo",
      "Chianti Wine Region",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=600&q=80",
  },
  {
    id: 17,
    name: "Tanzania",
    country: "Tanzania",
    continent: "Africa",
    vibe: "adventurous",
    budget: "high",
    description:
      "The Serengeti, Ngorongoro Crater, and Kilimanjaro — the ultimate African safari destination.",
    highlights: ["Serengeti Safari", "Ngorongoro Crater", "Zanzibar Beach"],
    imageUrl:
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80",
  },
  {
    id: 18,
    name: "Georgia (Country)",
    country: "Georgia",
    continent: "Europe",
    vibe: "adventurous",
    budget: "budget",
    description:
      "Caucasus mountain villages, ancient cave monasteries, legendary wine, and barely any tourists.",
    highlights: ["Kazbegi Mountains", "Vardzia Cave City", "Tbilisi Old Town"],
    imageUrl:
      "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=600&q=80",
  },
  {
    id: 19,
    name: "Peru",
    country: "Peru",
    continent: "South America",
    vibe: "adventurous",
    budget: "mid",
    description:
      "Machu Picchu, the Amazon, the Sacred Valley — ancient civilizations and staggering natural beauty.",
    highlights: ["Machu Picchu", "Sacred Valley", "Amazon Basin"],
    imageUrl:
      "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&q=80",
  },
  {
    id: 20,
    name: "Thailand",
    country: "Thailand",
    continent: "Asia",
    vibe: "adventurous",
    budget: "budget",
    description:
      "Temples, islands, street food, elephants, and a nightlife that goes till sunrise. Something for everyone.",
    highlights: [
      "Chiang Mai Temples",
      "Phi Phi Islands",
      "Bangkok Street Food",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80",
  },
];

module.exports = destinations;
