import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { Product } from "../models/product.model.js";
import APIFunctionality from "../utils/apiFunctionality.js";

//http://localhost:4000/api/v1/product/get-all-products?keyword=shirt

// 1️⃣ Create Product
const createProduct = AsyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ApiError("Product data is required", 400);
  }

  const product = await Product.create(req.body);

  if (!product) {
    throw new ApiError("Error while creating new Product", 500);
  }

  res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

// 2️⃣ Get All Products
const getAllProducts = AsyncHandler(async (req, res) => {
  // Destructure query parameters safely
  const { keyword = "" } = req.query;

  const apiFunctionality = new APIFunctionality(Product.find(), {
    keyword,
  });

  // Get products from DB
  const products = await Product.find();

  if (!products || products.length === 0) {
    throw new ApiError("No products found", 404);
  }

  // Send JSON response
  res
    .status(200)
    .json(
      new ApiResponse(200, products, "All products retrieved successfully")
    );
});

// 3️⃣ Update Product
const updateProduct = AsyncHandler(async (req, res) => {
  const productId = req.params.id;

  if (!productId) {
    throw new ApiError("Please provide a valid product ID", 400);
  }

  delete req.body._id;

  const updatedProduct = await Product.findByIdAndUpdate(productId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedProduct) {
    throw new ApiError("Product not found", 404);
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
});

// 4️⃣ Delete Product
const deleteProduct = AsyncHandler(async (req, res) => {
  const productId = req.params.id;

  if (!productId) {
    throw new ApiError("Please provide a valid product ID", 400);
  }

  const deletedProduct = await Product.findByIdAndDelete(productId);

  if (!deletedProduct) {
    throw new ApiError("Product not found", 404);
  }

  res
    .status(200)
    .json(new ApiResponse(200, deletedProduct, "Product deleted successfully"));
});

// 5️⃣ Get Product By ID
const getProductById = AsyncHandler(async (req, res) => {
  const productId = req.params.id;

  if (!productId) {
    throw new ApiError("Please provide a valid product ID", 400);
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError("Product not found", 404);
  }

  res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

export {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getProductById,
};
