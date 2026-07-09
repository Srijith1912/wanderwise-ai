const User = require("../models/User");
const Post = require("../models/Post");

const PUBLIC_FIELDS = "name profilePicture bio homeCountry travelInterests createdAt";
const POST_AUTHOR_FIELDS = "name email profilePicture";
const COMMENT_POPULATE = { path: "comments.userId", select: "name profilePicture" };

// @desc    Public profile for any user (+ follow counts and relationship to viewer)
// @route   GET /api/users/:id
// @access  Protected
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      PUBLIC_FIELDS + " followers following",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const viewerId = req.user.id;
    const isFollowing = user.followers.some((id) => id.toString() === viewerId);

    res.status(200).json({
      profile: {
        id: user._id,
        name: user.name,
        profilePicture: user.profilePicture || "",
        bio: user.bio || "",
        homeCountry: user.homeCountry || "",
        travelInterests: user.travelInterests || [],
        createdAt: user.createdAt,
        followerCount: user.followers.length,
        followingCount: user.following.length,
        isFollowing,
        isSelf: user._id.toString() === viewerId,
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

// @desc    Toggle follow/unfollow on another user
// @route   POST /api/users/:id/follow
// @access  Protected
const toggleFollow = async (req, res) => {
  try {
    const targetId = req.params.id;
    const viewerId = req.user.id;

    if (targetId === viewerId) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const target = await User.findById(targetId);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyFollowing = target.followers.some(
      (id) => id.toString() === viewerId,
    );

    if (alreadyFollowing) {
      await User.findByIdAndUpdate(targetId, { $pull: { followers: viewerId } });
      await User.findByIdAndUpdate(viewerId, { $pull: { following: targetId } });
    } else {
      await User.findByIdAndUpdate(targetId, {
        $addToSet: { followers: viewerId },
      });
      await User.findByIdAndUpdate(viewerId, {
        $addToSet: { following: targetId },
      });
    }

    const updated = await User.findById(targetId).select("followers");
    res.status(200).json({
      following: !alreadyFollowing,
      followerCount: updated.followers.length,
    });
  } catch (error) {
    console.error("Toggle follow error:", error);
    res.status(500).json({ message: "Server error toggling follow" });
  }
};

// @desc    List a user's followers
// @route   GET /api/users/:id/followers
// @access  Protected
const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "followers",
      PUBLIC_FIELDS,
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ users: user.followers });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({ message: "Server error fetching followers" });
  }
};

// @desc    List who a user follows
// @route   GET /api/users/:id/following
// @access  Protected
const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "following",
      PUBLIC_FIELDS,
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ users: user.following });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({ message: "Server error fetching following" });
  }
};

// @desc    Feed of posts from people the current user follows
// @route   GET /api/users/me/feed
// @access  Protected
const getFollowingFeed = async (req, res) => {
  try {
    const me = await User.findById(req.user.id).select("following");
    const authorIds = me.following || [];

    const posts = await Post.find({ userId: { $in: authorIds } })
      .populate("userId", POST_AUTHOR_FIELDS)
      .populate(COMMENT_POPULATE)
      .sort({ createdAt: -1 });

    res.status(200).json({ posts });
  } catch (error) {
    console.error("Get following feed error:", error);
    res.status(500).json({ message: "Server error fetching following feed" });
  }
};

module.exports = {
  getUserProfile,
  toggleFollow,
  getFollowers,
  getFollowing,
  getFollowingFeed,
};
