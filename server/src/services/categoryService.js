import Category from "../models/Category.js";
import ApiError from "../utils/ApiError.js";

// Create Category
export const createCategoryService = async (data) => {
  const { name, description, image } = data;

  if (!name) {
    throw new ApiError(400, "Category name is required.");
  }

  const existingCategory = await Category.findOne({
    name: name.trim(),
  });

  if (existingCategory) {
    throw new ApiError(400, "Category already exists.");
  }

  const category = await Category.create({
    name: name.trim(),
    description,
    image,
  });

  return category;
};

// Get All Categories
export const getCategoriesService = async () => {
  return await Category.find().sort({ createdAt: -1 });
};

// Get Category By ID
export const getCategoryByIdService = async (id) => {
  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  return category;
};

// Update Category
export const updateCategoryService = async (id, data) => {
  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  Object.assign(category, data);

  await category.save();

  return category;
};

// Delete Category
export const deleteCategoryService = async (id) => {
  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, "Category not found.");
  }

  await category.deleteOne();

  return null;
};