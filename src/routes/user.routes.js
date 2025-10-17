import express from "express";
const router = express.Router();

// Routes
import { registerUser } from "../controller/user.controller.js";
import { Upload } from "../middleware/multer.middleware.js";

router.route("/register").post(Upload.single("avatar"), registerUser);

export default router;
