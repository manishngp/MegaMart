import asyncHandler from "../middleware/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  createProductService,
  getProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
} from "../services/productService.js";

// Create Product
export const createProduct = asyncHandler(async (req, res) => {
  const product = await createProductService(req.body, req.user);

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Product created successfully.",
        product
      )
    );
});

// Get All Products
export const getProducts = asyncHandler(async (req, res) => {
  const products = await getProductsService(req.query);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Products fetched successfully.",
        products
      )
    );
});

// Get Product By ID
export const getProductById = asyncHandler(async (req, res) => {
  const product = await getProductByIdService(req.params.id);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Product fetched successfully.",
        product
      )
    );
});

// Update Product
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await updateProductService(
    req.params.id,
    req.body
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Product updated successfully.",
        product
      )
    );
});

// Delete Product
export const deleteProduct = asyncHandler(async (req, res) => {
  await deleteProductService(req.params.id);

  res.status(200).json(
    new ApiResponse(
      200,
      "Product deleted successfully."
    )
  );
});