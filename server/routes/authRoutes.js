// server/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
// We'll create authMiddleware in Step 5

// Public routes (no authentication needed)
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected route (authentication required)
router.get("/me", authMiddleware, authController.getCurrentUser);

module.exports = router;
