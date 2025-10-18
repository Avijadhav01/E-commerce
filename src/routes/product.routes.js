import express from "express";
import {
  authorizeRoles,
  verifyUserAuth,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Routes
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from "../controller/product.controller.js";
import { Upload } from "../middleware/multer.middleware.js";

router.route("/get-all-products").get(verifyUserAuth, getAllProducts);
router.route("/create").post(
  verifyUserAuth,
  authorizeRoles("admin"),
  Upload.array("productImages", 5), // allow up to 5 images
  createProduct
);
router
  .route("/update/:id")
  .put(verifyUserAuth, authorizeRoles("admin"), updateProduct);
router
  .route("/delete/:id")
  .delete(verifyUserAuth, authorizeRoles("admin"), deleteProduct);
router.route("/getproduct/:id").get(verifyUserAuth, getProductById);

export default router;
