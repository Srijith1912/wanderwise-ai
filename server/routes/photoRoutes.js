const express = require("express");
const router = express.Router();
const { getPhoto } = require("../controllers/photoController");

// Public — used by the Explore landing while logged out.
router.get("/", getPhoto);

module.exports = router;
