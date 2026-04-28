const Post = require("../models/Post");

const POPULATE_FIELDS = "name email profilePicture";

// @desc    Create a new post
// @route   POST /api/posts
// @access  Protected
const createPost = async (req, res) => {
  try {
    const { caption, destinationTag, imageUrl } = req.body;

    if (!caption || caption.trim() === "") {
      return res.status(400).json({ message: "Caption is required" });
    }

    const post = await Post.create({
      userId: req.user.id,
      caption,
      destinationTag: destinationTag || "",
      imageUrl: imageUrl || "",
      likes: [],
    });

    const populated = await post.populate("userId", POPULATE_FIELDS);

    res.status(201).json({ post: populated });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Server error creating post" });
  }
};

// @desc    Get all posts (newest first)
// @route   GET /api/posts
// @access  Protected
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", POPULATE_FIELDS)
      .sort({ createdAt: -1 });

    res.status(200).json({ posts });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: "Server error fetching posts" });
  }
};

// @desc    Get posts by a specific user
// @route   GET /api/posts/user/:userId
// @access  Protected
const getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .populate("userId", POPULATE_FIELDS)
      .sort({ createdAt: -1 });

    res.status(200).json({ posts });
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({ message: "Server error fetching user posts" });
  }
};

// @desc    Toggle like on a post
// @route   POST /api/posts/:id/like
// @access  Protected
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user.id;
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({ likes: post.likes, likeCount: post.likes.length });
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({ message: "Server error liking post" });
  }
};

module.exports = { createPost, getPosts, getPostsByUser, likePost };
