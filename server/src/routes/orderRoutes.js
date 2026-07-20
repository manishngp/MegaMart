import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/orderController.js";
import { authorize } from "../middleware/roleMiddleware.js";
const router = express.Router();

router.get("/my-orders", protect, getMyOrders);
router.post("/", protect, placeOrder);
router.get("/:id", protect, getOrderById);
router.get("/", protect, authorize("admin"), getAllOrders);
router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  updateOrderStatus
);
router.patch(
  "/:id/cancel",
  protect,
  cancelOrder
);

export default router;