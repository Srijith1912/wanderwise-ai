// server/controllers/authController.js

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, // Payload (what's inside the token)
    process.env.JWT_SECRET, // Secret key (only backend knows this)
    { expiresIn: "7d" }, // Token expires in 7 days
  );
};

// REGISTER: Create a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Step 1: Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // Step 2: Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Step 3: Hash the password
    const salt = await bcrypt.genSalt(10);
    // genSalt(10) creates random data. The number (10) is "cost factor"
    // Higher = slower (more secure), lower = faster (less secure)
    // 10 is industry standard

    const hashedPassword = await bcrypt.hash(password, salt);
    // hash() turns plain password + salt into scrambled text
    // Can never be reversed (one-way function)

    // Step 4: Create user in database
    const user = await User.create({
      name,
      email,
      password: hashedPassword, // Store HASHED password, not plain
    });

    // Step 5: Generate JWT token
    const token = generateToken(user._id);

    // Step 6: Return success response
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
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

// LOGIN: Authenticate user and return token
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Step 1: Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Step 2: Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Step 3: Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    // compare() takes plain password and hashed password
    // Returns true if they match, false otherwise
    // It's safe because it uses the same hash function

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Step 4: Generate JWT token
    const token = generateToken(user._id);

    // Step 5: Return success response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
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

// GET CURRENT USER: Return user data (protected route)
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user is added by the auth middleware (we'll create it next)
    // It contains the user ID extracted from the JWT token

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
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
