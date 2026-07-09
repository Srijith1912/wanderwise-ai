const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  toggleFollow,
  getFollowers,
  getFollowing,
  getFollowingFeed,
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

// Static path before "/:id" so "me" isn't treated as a user id.
router.get("/me/feed", protect, getFollowingFeed);

router.get("/:id", protect, getUserProfile);
router.post("/:id/follow", protect, toggleFollow);
router.get("/:id/followers", protect, getFollowers);
router.get("/:id/following", protect, getFollowing);

module.exports = router;
