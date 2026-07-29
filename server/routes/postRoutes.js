const express = require("express");
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostsByUser,
  likePost,
  addComment,
  getComments,
  deleteComment,
  toggleSavePost,
  getSavedPosts,
  editPost,
  deletePost,
  toggleArchivePost,
  toggleCommentLike,
} = require("../controllers/postController");
const protect = require("../middleware/authMiddleware");

router.post("/", protect, createPost);
router.get("/", protect, getPosts);

// Static paths before param paths so they don't get captured by "/:id/..."
router.get("/saved/me", protect, getSavedPosts);
router.get("/user/:userId", protect, getPostsByUser);

router.patch("/:id", protect, editPost);
router.delete("/:id", protect, deletePost);
router.post("/:id/archive", protect, toggleArchivePost);

router.post("/:id/like", protect, likePost);
router.post("/:id/save", protect, toggleSavePost);
router.post("/:id/comment", protect, addComment);
router.get("/:id/comments", protect, getComments);
router.delete("/:id/comment/:commentId", protect, deleteComment);
router.post("/:id/comment/:commentId/like", protect, toggleCommentLike);

module.exports = router;
