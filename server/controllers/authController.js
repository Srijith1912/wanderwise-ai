// server/controllers/authController.js

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Mirrors client-side validation in SignupPage.jsx — must stay in sync.
const validatePassword = (password) => {
  const checks = {
    length: typeof password === "string" && password.length >= 8,
    uppercase: /[A-Z]/.test(password || ""),
    number: /\d/.test(password || ""),
    special: /[!@#$%^&*()_\-+=\[\]{};:'",.<>\/?\\|`~]/.test(password || ""),
  };
  const failed = [];
  if (!checks.length) failed.push("at least 8 characters");
  if (!checks.uppercase) failed.push("an uppercase letter");
  if (!checks.number) failed.push("a number");
  if (!checks.special) failed.push("a special character");
  return failed;
};

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  bio: user.bio || "",
  profilePicture: user.profilePicture || "",
  homeCountry: user.homeCountry || "",
  travelInterests: user.travelInterests || [],
});

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    const passwordIssues = validatePassword(password);
    if (passwordIssues.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Password must contain ${passwordIssues.join(", ")}.`,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: userResponse(user),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userResponse(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

// GET CURRENT USER
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: userResponse(user),
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// CHANGE PASSWORD — requires current password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both current and new password are required",
      });
    }

    const passwordIssues = validatePassword(newPassword);
    if (passwordIssues.length > 0) {
      return res.status(400).json({
        success: false,
        message: `New password must contain ${passwordIssues.join(", ")}.`,
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({ success: true, message: "Password updated" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error changing password",
      error: error.message,
    });
  }
};

// CHANGE EMAIL — requires current password
exports.changeEmail = async (req, res) => {
  try {
    const { currentPassword, newEmail } = req.body;

    if (!currentPassword || !newEmail) {
      return res.status(400).json({
        success: false,
        message: "Current password and new email are required",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return res
        .status(401)
        .json({ success: false, message: "Password is incorrect" });
    }

    const conflict = await User.findOne({ email: newEmail });
    if (conflict && conflict._id.toString() !== user._id.toString()) {
      return res
        .status(409)
        .json({ success: false, message: "Email is already in use" });
    }

    user.email = newEmail;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email updated",
      user: userResponse(user),
    });
  } catch (error) {
    console.error("Change email error:", error);
    res.status(500).json({
      success: false,
      message: "Server error changing email",
      error: error.message,
    });
  }
};

// UPDATE PROFILE — name, bio, profilePicture, homeCountry, travelInterests
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, profilePicture, homeCountry, travelInterests } =
      req.body;

    const updates = {};
    if (typeof name === "string" && name.trim()) updates.name = name.trim();
    if (typeof bio === "string") updates.bio = bio;
    if (typeof profilePicture === "string")
      updates.profilePicture = profilePicture;
    if (typeof homeCountry === "string") updates.homeCountry = homeCountry;
    if (Array.isArray(travelInterests)) updates.travelInterests = travelInterests;

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      user: userResponse(user),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating profile",
      error: error.message,
    });
  }
};
