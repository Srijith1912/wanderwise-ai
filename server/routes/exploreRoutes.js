const express = require("express");
const router = express.Router();
const { getDestinations } = require("../controllers/exploreController");

router.get("/", getDestinations);

module.exports = router;
