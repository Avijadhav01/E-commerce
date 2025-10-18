import express from "express";
import { Upload } from "../middleware/multer.middleware.js";
import {
  authorizeRoles,
  verifyUserAuth,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Routes
import {
  registerUser,
  login,
  logOut,
  deleteUser,
} from "../controller/user.controller.js";

router.route("/register").post(Upload.single("avatar"), registerUser);
router.route("/login").post(login);
router.route("/logout").post(verifyUserAuth, logOut);
router
  .route("/delete-account/:id")
  .post(verifyUserAuth, authorizeRoles("admin"), deleteUser);

export default router;
