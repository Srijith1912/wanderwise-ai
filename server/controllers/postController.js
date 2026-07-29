const Post = require("../models/Post");
const User = require("../models/User");

const POPULATE_FIELDS = "name email profilePicture";
const COMMENT_POPULATE = { path: "comments.userId", select: "name profilePicture" };

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
      comments: [],
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
    const posts = await Post.find({ isArchived: { $ne: true } })
      .populate("userId", POPULATE_FIELDS)
      .populate(COMMENT_POPULATE)
      .sort({ createdAt: -1 });

    res.status(200).json({ posts });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ message: "Server error fetching posts" });
  }
};

// @desc    Get posts by a specific user. The owner can pass ?archived=true to
//          fetch their archived posts instead; everyone else only ever sees
//          non-archived ones.
// @route   GET /api/posts/user/:userId
// @access  Protected
const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const isOwner = req.user.id === userId;
    const wantArchived = isOwner && req.query.archived === "true";

    const posts = await Post.find({
      userId,
      isArchived: wantArchived ? true : { $ne: true },
    })
      .populate("userId", POPULATE_FIELDS)
      .populate(COMMENT_POPULATE)
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

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comment
// @access  Protected
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({ userId: req.user.id, text: text.trim() });
    await post.save();
    await post.populate(COMMENT_POPULATE);

    // Return the newly added comment (last in the array), fully populated.
    const newComment = post.comments[post.comments.length - 1];
    res.status(201).json({ comment: newComment, commentCount: post.comments.length });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Server error adding comment" });
  }
};

// @desc    List comments on a post (populated)
// @route   GET /api/posts/:id/comments
// @access  Protected
const getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(COMMENT_POPULATE);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ comments: post.comments });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Server error fetching comments" });
  }
};

// @desc    Delete own comment (or any comment on your own post)
// @route   DELETE /api/posts/:id/comment/:commentId
// @access  Protected
const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const userId = req.user.id;
    const isCommentAuthor = comment.userId.toString() === userId;
    const isPostOwner = post.userId.toString() === userId;
    if (!isCommentAuthor && !isPostOwner) {
      return res.status(403).json({ message: "Not allowed to delete this comment" });
    }

    comment.deleteOne();
    await post.save();

    res.status(200).json({ commentCount: post.comments.length });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Server error deleting comment" });
  }
};

// @desc    Toggle save/bookmark on a post
// @route   POST /api/posts/:id/save
// @access  Protected
const toggleSavePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(req.user.id);
    const postId = post._id.toString();
    const alreadySaved = user.savedPosts.some((id) => id.toString() === postId);

    if (alreadySaved) {
      user.savedPosts = user.savedPosts.filter((id) => id.toString() !== postId);
    } else {
      user.savedPosts.push(post._id);
    }
    await user.save();

    res.status(200).json({ saved: !alreadySaved, savedPosts: user.savedPosts });
  } catch (error) {
    console.error("Toggle save post error:", error);
    res.status(500).json({ message: "Server error saving post" });
  }
};

// @desc    Get the current user's saved/bookmarked posts
// @route   GET /api/posts/saved/me
// @access  Protected
const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "savedPosts",
      match: { isArchived: { $ne: true } },
      populate: [
        { path: "userId", select: POPULATE_FIELDS },
        COMMENT_POPULATE,
      ],
      options: { sort: { createdAt: -1 } },
    });

    // Filter out any bookmarks whose post has since been deleted or archived
    // (the populate `match` above leaves those as null).
    const posts = (user.savedPosts || []).filter(Boolean);
    res.status(200).json({ posts });
  } catch (error) {
    console.error("Get saved posts error:", error);
    res.status(500).json({ message: "Server error fetching saved posts" });
  }
};

// @desc    Edit own post's caption, image and/or destination tag
// @route   PATCH /api/posts/:id
// @access  Protected
const editPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed to edit this post" });
    }

    const { caption, imageUrl, destinationTag } = req.body;

    if (caption !== undefined) {
      if (!caption || caption.trim() === "") {
        return res.status(400).json({ message: "Caption cannot be empty" });
      }
      post.caption = caption.trim();
    }
    if (imageUrl !== undefined) {
      post.imageUrl = imageUrl; // "" removes the image
    }
    if (destinationTag !== undefined) {
      post.destinationTag = destinationTag.trim(); // "" removes the tag
    }
    post.editedAt = new Date();

    await post.save();
    await post.populate("userId", POPULATE_FIELDS);
    await post.populate(COMMENT_POPULATE);

    res.status(200).json({ post });
  } catch (error) {
    console.error("Edit post error:", error);
    res.status(500).json({ message: "Server error editing post" });
  }
};

// @desc    Permanently delete own post
// @route   DELETE /api/posts/:id
// @access  Protected
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed to delete this post" });
    }

    await post.deleteOne();

    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Server error deleting post" });
  }
};

// @desc    Toggle archive on own post (hides it everywhere but the owner's
//          Archived tab; reversible)
// @route   POST /api/posts/:id/archive
// @access  Protected
const toggleArchivePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed to archive this post" });
    }

    post.isArchived = !post.isArchived;
    await post.save();

    res.status(200).json({ isArchived: post.isArchived });
  } catch (error) {
    console.error("Archive post error:", error);
    res.status(500).json({ message: "Server error archiving post" });
  }
};

// @desc    Toggle like on a comment
// @route   POST /api/posts/:id/comment/:commentId/like
// @access  Protected
const toggleCommentLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const userId = req.user.id;
    const alreadyLiked = comment.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    } else {
      comment.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      commentId: comment._id,
      likes: comment.likes,
      likeCount: comment.likes.length,
    });
  } catch (error) {
    console.error("Like comment error:", error);
    res.status(500).json({ message: "Server error liking comment" });
  }
};

module.exports = {
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
};
