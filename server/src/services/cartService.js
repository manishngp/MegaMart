import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";

// Helper: Calculate Cart Totals
const calculateCartTotals = (cart) => {
  cart.totalItems = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.quantity * item.priceAtAddition,
    0
  );
};

// Add to Cart
export const addToCartService = async (
  userId,
  productId,
  quantity = 1
) => {
  // Validate Product ID
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID.");
  }

  // Validate Quantity
  if (quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1.");
  }

  // Find Product
  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    throw new ApiError(404, "Product not found.");
  }

  // Check Stock
  if (quantity > product.stock) {
    throw new ApiError(
      400,
      `Only ${product.stock} item(s) available in stock.`
    );
  }

  // Find or Create Cart
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  // Check if Product Already Exists
  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    if (newQuantity > product.stock) {
      throw new ApiError(
        400,
        `Only ${product.stock} item(s) available in stock.`
      );
    }

    existingItem.quantity = newQuantity;
    existingItem.priceAtAddition =
      product.discountPrice || product.price;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
      priceAtAddition:
        product.discountPrice || product.price,
    });
  }

  // Update Totals
  calculateCartTotals(cart);

  await cart.save();

  return await Cart.findById(cart._id).populate(
    "items.product",
    "name brand price discountPrice images stock"
  );
};

// Get Cart
export const getCartService = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    "name brand price discountPrice images stock isActive"
  );

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
      totalItems: 0,
      totalPrice: 0,
    });

    cart = await Cart.findById(cart._id).populate(
      "items.product",
      "name brand price discountPrice images stock isActive"
    );
  }

  return cart;
};

// Update Cart Item Quantity
export const updateCartItemService = async (
  userId,
  productId,
  quantity
) => {
  // Validate Product ID
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID.");
  }

  // Validate Quantity
  if (quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1.");
  }

  // Find Cart
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new ApiError(404, "Cart not found.");
  }

  // Find Cart Item
  const item = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (!item) {
    throw new ApiError(404, "Product not found in cart.");
  }

  // Find Product
  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    throw new ApiError(404, "Product not found.");
  }

  // Check Stock
  if (quantity > product.stock) {
    throw new ApiError(
      400,
      `Only ${product.stock} item(s) available in stock.`
    );
  }

  // Update Quantity
  item.quantity = quantity;
  item.priceAtAddition =
    product.discountPrice || product.price;

  // Update Totals
  calculateCartTotals(cart);

  await cart.save();

  return await Cart.findById(cart._id).populate(
    "items.product",
    "name brand price discountPrice images stock"
  );
};

// Remove Item From Cart
export const removeCartItemService = async (userId, productId) => {
  // Validate Product ID
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID.");
  }

  // Find Cart
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new ApiError(404, "Cart not found.");
  }

  // Check if product exists in cart
  const itemExists = cart.items.some(
    (item) => item.product.toString() === productId
  );

  if (!itemExists) {
    throw new ApiError(404, "Product not found in cart.");
  }

  // Remove Item
  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  // Recalculate Totals
  calculateCartTotals(cart);

  await cart.save();

  return await Cart.findById(cart._id).populate(
    "items.product",
    "name brand price discountPrice images stock"
  );
};

// Clear Cart
export const clearCartService = async (userId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new ApiError(404, "Cart not found.");
  }

  cart.items = [];
  cart.totalItems = 0;
  cart.totalPrice = 0;

  await cart.save();

  return cart;
};