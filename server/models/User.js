const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      // Optional so OAuth users (Google) can exist without a local password.
      required: false,
    },
    googleId: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: "",
    },
    homeCountry: {
      type: String,
      default: "",
    },
    travelInterests: {
      type: [String],
      default: [],
    },
    profilePicture: {
      type: String,
      default: "",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
