import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DB_URI}/${DB_NAME}`
    );

    console.log(
      `\n✅ MongoDB connected successfully! DB Host: ${connectionInstance.connection.host}\n`
    );
  } catch (error) {
    console.error("❌ MONGODB CONNECTION FAILED : ", error.message);
    console.log(
      "🔁 Server is shutting down, due to unhandled promise rejection"
    );
    process.exit(1); // Exit the app if DB connection fails
  }
};

export { connectDB };
