import express from "express";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public Routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin Routes
router.post("/", protect, authorize("admin"), createProduct);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateProduct
);


router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteProduct
);
export default router;