import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import ApiError from "../utils/ApiError.js";

// Create Product
export const createProductService = async (data, user) => {
  const {
    name,
    description,
    brand,
    category,
    price,
    discountPrice,
    stock,
    images,
    isFeatured,
  } = data;

  if (
    !name ||
    !description ||
    !brand ||
    !category ||
    price === undefined ||
    stock === undefined
  ) {
    throw new ApiError(400, "Please provide all required fields.");
  }

  if (!mongoose.Types.ObjectId.isValid(category)) {
    throw new ApiError(400, "Invalid category ID.");
  }

  const categoryExists = await Category.findById(category);

  if (!categoryExists) {
    throw new ApiError(404, "Category not found.");
  }

  if (
    discountPrice !== undefined &&
    Number(discountPrice) > Number(price)
  ) {
    throw new ApiError(
      400,
      "Discount price cannot be greater than price."
    );
  }

  const product = await Product.create({
    name,
    description,
    brand,
    category,
    price,
    discountPrice,
    stock,
    images,
    isFeatured,
    createdBy: user._id,
  });

  return product;
};

// Get All Products
export const getProductsService = async (query) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    minPrice,
    maxPrice,
    sort = "-createdAt",
  } = query;

  const filter = { isActive: true };

  if (search) {
    filter.name = {
      $regex: search,
      $options: "i",
    };
  }

  if (category) {
    filter.category = category;
  }

  if (minPrice || maxPrice) {
    filter.price = {};

    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const products = await Product.find(filter)
    .populate("category", "name")
    .populate("createdBy", "name email")
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Product.countDocuments(filter);

  return {
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    products,
  };
};

// Get Product By ID
export const getProductByIdService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid product ID.");
  }

  const product = await Product.findById(id)
    .populate("category", "name")
    .populate("createdBy", "name email");

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  return product;
};

// Update Product
export const updateProductService = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid product ID.");
  }

  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  // Validate category if provided
  if (data.category) {
    if (!mongoose.Types.ObjectId.isValid(data.category)) {
      throw new ApiError(400, "Invalid category ID.");
    }

    const category = await Category.findById(data.category);

    if (!category) {
      throw new ApiError(404, "Category not found.");
    }
  }

  // Validate discount price
  const price = data.price ?? product.price;
  const discountPrice =
    data.discountPrice ?? product.discountPrice;

  if (
    discountPrice !== undefined &&
    discountPrice > price
  ) {
    throw new ApiError(
      400,
      "Discount price cannot be greater than price."
    );
  }

  Object.assign(product, data);

  await product.save();

  return product;
};

// Delete Product (Soft Delete)
export const deleteProductService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid product ID.");
  }

  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found.");
  }

  product.isActive = false;

  await product.save();

  return product;
};