import asyncHandler from "../middleware/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  placeOrderService,
  getMyOrdersService,
  getOrderByIdService,
  getAllOrdersService,
  updateOrderStatusService,
  cancelOrderService,
} from "../services/orderService.js";
// Place Order
export const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  const order = await placeOrderService(
    req.user._id,
    shippingAddress,
    paymentMethod
  );

  res.status(201).json(
    new ApiResponse(
      201,
      "Order placed successfully.",
      order
    )
  );
});

// Get My Orders
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await getMyOrdersService(req.user._id);

  res.status(200).json(
    new ApiResponse(
      200,
      "Orders fetched successfully.",
      orders
    )
  );
});

// Get Order By ID
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await getOrderByIdService(
    req.user._id,
    req.user.role,
    req.params.id
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Order fetched successfully.",
      order
    )
  );
});

// Get All Orders (Admin)
export const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const result = await getAllOrdersService(
    page,
    limit
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Orders fetched successfully.",
      result
    )
  );
});

// Update Order Status (Admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;

  const order = await updateOrderStatusService(
    req.params.id,
    orderStatus
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Order status updated successfully.",
      order
    )
  );
});

// Cancel Order
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await cancelOrderService(
    req.user._id,
    req.user.role,
    req.params.id
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Order cancelled successfully.",
      order
    )
  );
});