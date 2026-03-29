const express = require("express");
const router = express.Router();
const {
  generateTrip,
  saveTrip,
  getTrips,
  getTripById,
  deleteTrip,
  updateTrip,
} = require("../controllers/tripController");
const protect = require("../middleware/authMiddleware");

router.post("/generate", protect, generateTrip);
router.post("/save", protect, saveTrip);
router.get("/", protect, getTrips);
router.get("/:id", protect, getTripById);
router.delete("/:id", protect, deleteTrip);
router.put("/:id", protect, updateTrip);

module.exports = router;
