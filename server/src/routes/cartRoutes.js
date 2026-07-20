import express from "express";

import {protect} from "../middleware/authMiddleware.js";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";
const router = express.Router();

// Customer must be logged in
router.post("/", protect, addToCart);


router.get("/", protect, getCart);
router.patch(
  "/:productId",
  protect,
  updateCartItem
);

router.delete(
  "/:productId",
  protect,
  removeCartItem
);

router.delete("/", protect, clearCart);

export default router;