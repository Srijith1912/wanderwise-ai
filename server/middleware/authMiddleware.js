// server/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Step 1: Get token from Authorization header
    // Format: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided or invalid format",
      });
    }

    // Step 2: Extract token (remove "Bearer " prefix)
    const token = authHeader.slice(7);
    // "Bearer xyz123abc456" → slice(7) → "xyz123abc456"

    // Step 3: Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // verify() checks:
    // - Is the signature valid? (tampering check)
    // - Is the token expired?
    // If valid, it returns the payload (what's inside the token)

    // Step 4: Attach user info to request
    req.user = decoded;
    // Now any function after this middleware can access req.user.id

    // Step 5: Continue to next middleware/controller
    next();
  } catch (error) {
    // Token is invalid, expired, or tampered with
    console.error("Auth error:", error.message);

    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

module.exports = authMiddleware;
