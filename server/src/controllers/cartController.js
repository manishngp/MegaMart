import asyncHandler from "../middleware/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  addToCartService,
  getCartService,
  updateCartItemService,
  removeCartItemService,
  clearCartService,
} from "../services/cartService.js";
// Add to Cart
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const cart = await addToCartService(
    req.user._id,
    productId,
    quantity
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Product added to cart successfully.",
        cart
      )
    );
});
// Get My Cart
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getCartService(req.user._id);

  res.status(200).json(
    new ApiResponse(
      200,
      "Cart fetched successfully.",
      cart
    )
  );
});
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  const cart = await updateCartItemService(
    req.user._id,
    req.params.productId,
    quantity
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Cart updated successfully.",
      cart
    )
  );
});

// Remove Item From Cart
export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await removeCartItemService(
    req.user._id,
    req.params.productId
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "Product removed from cart successfully.",
      cart
    )
  );
});

// Clear Cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await clearCartService(req.user._id);

  res.status(200).json(
    new ApiResponse(
      200,
      "Cart cleared successfully.",
      cart
    )
  );
});