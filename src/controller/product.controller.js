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

  if (!req.user) {
    throw new ApiError("Unauthorized: Please log in to create a product", 401);
  }

  const product = await Product.create({ ...req.body, user: req.user._id });

  if (!product) {
    throw new ApiError("Error while creating new Product", 500);
  }

  res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

// 2️⃣ Get All Products
const getAllProducts = AsyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  // Build query and filters
  const apiFeatures = new APIFunctionality(Product.find(), req.query)
    .search()
    .filter(); // now apiFeatures.filterQuery is set and this.query has the base .find(filter)

  // 1) This will ask "Hey MongoDB, count how many products exist that match the filters stored inside filterQuery"
  const totalProducts = await Product.countDocuments(apiFeatures.filterQuery);

  // 2) Compute total pages
  const totalPages = Math.ceil(totalProducts / limit) || 1;

  // 3) Apply pagination and execute the paginated query
  apiFeatures.paginate(limit, totalPages);
  const products = await apiFeatures.query;

  // ✅ Return empty array (not error) when no products found
  if (!products || products.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No products found"));
  }

  // Optional: adjust current page if it exceeds totalPages
  const currentPage = page > totalPages ? totalPages : page;

  // 4) Send response with meta
  res.status(200).json({
    statusCode: 200,
    success: true,
    data: products,
    meta: {
      totalProducts,
      totalPages,
      currentPage,
      limit,
    },
    message: products.length
      ? "Products retrieved successfully"
      : "No products found",
  });
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
