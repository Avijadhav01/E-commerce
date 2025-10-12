import { app } from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./db/db.js";
dotenv.config({ path: "./.env" });

const port = process.env.PORT || 2000;

// 🔹 Handle uncaught exceptions (sync code errors)
process.on("uncaughtException", (err) => {
  console.error(`🔥 Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Handle app-level errors
app.on("error", (err) => {
  console.error("❌ APP Error:", err);
  process.exit(1);
});

// console.log(MY_NAME);

// Connect DB and start server
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ MONGODB connection FAILED !!!", err);
  });
