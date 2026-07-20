import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";

export const placeOrderService = async (
  userId,
  shippingAddress,
  paymentMethod
) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    // Get cart
    const cart = await Cart.findOne({ user: userId })
      .populate("items.product")
      .session(session);

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, "Your cart is empty.");
    }

    const orderItems = [];

    // Verify stock and prepare order items
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id).session(session);

      if (!product || !product.isActive) {
        throw new ApiError(
          404,
          `${item.product.name} is no longer available.`
        );
      }

      if (product.stock < item.quantity) {
        throw new ApiError(
          400,
          `Only ${product.stock} item(s) available for ${product.name}.`
        );
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0] || "",
        quantity: item.quantity,
        price: item.priceAtAddition,
      });

      // Reduce stock
      product.stock -= item.quantity;

      await product.save({ session });
    }

    // Create order
    const order = await Order.create(
      [
        {
          user: userId,
          orderItems,
          shippingAddress,
          paymentMethod,
          paymentStatus:
            paymentMethod === "COD" ? "Pending" : "Pending",
          orderStatus: "Pending",
          totalItems: cart.totalItems,
          totalPrice: cart.totalPrice,
        },
      ],
      { session }
    );

    // Clear cart
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;

    await cart.save({ session });

    await session.commitTransaction();

    return await Order.findById(order[0]._id)
      .populate("user", "name email")
      .populate("orderItems.product", "name images");
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Get My Orders
export const getMyOrdersService = async (userId) => {
  const orders = await Order.find({ user: userId })
    .populate(
      "orderItems.product",
      "name images price discountPrice"
    )
    .sort({ createdAt: -1 });

  return orders;
};

// Get Order By ID
export const getOrderByIdService = async (userId, role, orderId) => {
  // Validate Order ID
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID.");
  }

  const order = await Order.findById(orderId)
    .populate("user", "name email")
    .populate(
      "orderItems.product",
      "name images price discountPrice"
    );

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  // Authorization
  if (
    role !== "admin" &&
    order.user._id.toString() !== userId.toString()
  ) {
    throw new ApiError(
      403,
      "You are not authorized to access this order."
    );
  }

  return order;
};

// Get All Orders (Admin)
export const getAllOrdersService = async (
  page = 1,
  limit = 10
) => {
  page = Number(page);
  limit = Number(limit);

  const skip = (page - 1) * limit;

  const totalOrders = await Order.countDocuments();

  const orders = await Order.find()
    .populate("user", "name email")
    .populate(
      "orderItems.product",
      "name images"
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    totalOrders,
    currentPage: page,
    totalPages: Math.ceil(totalOrders / limit),
    orders,
  };
};

// Update Order Status (Admin)
export const updateOrderStatusService = async (
  orderId,
  orderStatus
) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID.");
  }

  const validStatuses = [
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  if (!validStatuses.includes(orderStatus)) {
    throw new ApiError(400, "Invalid order status.");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  // Business Rules
  if (order.orderStatus === "Cancelled") {
    throw new ApiError(
      400,
      "Cancelled orders cannot be updated."
    );
  }

  if (order.orderStatus === "Delivered") {
    throw new ApiError(
      400,
      "Delivered orders cannot be updated."
    );
  }

  order.orderStatus = orderStatus;

  if (orderStatus === "Delivered") {
    order.isDelivered = true;
    order.deliveredAt = new Date();

    // Optional: mark COD orders as paid on delivery
    if (
      order.paymentMethod === "COD" &&
      order.paymentStatus === "Pending"
    ) {
      order.paymentStatus = "Paid";
    }
  }

  await order.save();

  return await Order.findById(order._id)
    .populate("user", "name email")
    .populate("orderItems.product", "name images");
};

// Cancel Order
export const cancelOrderService = async (
  userId,
  role,
  orderId
) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID.");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId)
      .populate("orderItems.product")
      .session(session);

    if (!order) {
      throw new ApiError(404, "Order not found.");
    }

    // Authorization
    if (
      role !== "admin" &&
      order.user.toString() !== userId.toString()
    ) {
      throw new ApiError(
        403,
        "You are not authorized to cancel this order."
      );
    }

    if (order.orderStatus === "Cancelled") {
      throw new ApiError(
        400,
        "Order is already cancelled."
      );
    }

    if (
      order.orderStatus === "Shipped" ||
      order.orderStatus === "Delivered"
    ) {
      throw new ApiError(
        400,
        `Cannot cancel a ${order.orderStatus.toLowerCase()} order.`
      );
    }

    // Restore stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product._id).session(session);

      if (product) {
        product.stock += item.quantity;
        await product.save({ session });
      }
    }

    order.orderStatus = "Cancelled";

    await order.save({ session });

    await session.commitTransaction();

    return await Order.findById(order._id)
      .populate("user", "name email")
      .populate("orderItems.product", "name images");
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};