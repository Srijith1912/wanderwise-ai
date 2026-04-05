const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");
const postRoutes = require("./routes/postRoutes");
const exploreRoutes = require("./routes/exploreRoutes");

const app = express();

connectDB();

// Middleware
const allowedOrigins = ["http://localhost:5173", process.env.CLIENT_URL].filter(
  Boolean,
);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/explore", exploreRoutes);

const PORT = process.env.PORT || 5000;

// Test route (no DB yet)
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
