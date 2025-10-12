import express from "express";
const router = express.Router();

// Routes
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from "../controller/product.controller.js";

router.route("/get-all-products").get(getAllProducts);
router.route("/create").post(createProduct);
router.route("/:id").put(updateProduct);
router.route("/:id").delete(deleteProduct);
router.route("/:id").get(getProductById);

export default router;
