const express = require("express");
const router = express.Router();
const { getPins } = require("../controllers/geoController");
const protect = require("../middleware/authMiddleware");

router.post("/pins", protect, getPins);

module.exports = router;
