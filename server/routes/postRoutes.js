const express = require("express");
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostsByUser,
  likePost,
} = require("../controllers/postController");
const protect = require("../middleware/authMiddleware");

router.post("/", protect, createPost);
router.get("/", protect, getPosts);
router.get("/user/:userId", protect, getPostsByUser);
router.post("/:id/like", protect, likePost);

module.exports = router;
