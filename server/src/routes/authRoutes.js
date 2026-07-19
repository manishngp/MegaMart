import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected Route
router.get("/profile", protect, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

// Admin Only Route
router.get("/admin", protect, authorize("admin"), (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome Admin",
    user: req.user,
  });
});

export default router;