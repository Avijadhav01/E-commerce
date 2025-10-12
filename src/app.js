import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middleware/error.middleware.js";
import productRouter from "./routes/product.routes.js"; // adjust path if needed

const app = express();

app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// 🧭 Routes
app.use("/api/v1/product", productRouter);

// ⚠️ Error middleware should be the LAST one
app.use(errorMiddleware);

export { app };
