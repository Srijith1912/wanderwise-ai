const express = require("express");
const router = express.Router();
const { getDestinations, getTrending } = require("../controllers/exploreController");

router.get("/", getDestinations);
router.get("/trending", getTrending);

module.exports = router;
