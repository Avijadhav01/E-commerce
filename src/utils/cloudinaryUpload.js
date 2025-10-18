import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("❌ Cloudinary credentials are missing!");
  process.exit(1);
} else {
  console.log("✅ Cloudinary credentials found.");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath || !fs.existsSync(localFilePath)) return null;

    // 🔽 Uploading file to Cloudinary
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: "users/avatars", // ← this is your folder path

      resource_type: "auto", // auto-detect (image, video, pdf, etc.)
    });

    // ✅ Return only two useful fields
    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new ApiError(500, "Cloudinary upload failed");
  } finally {
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath); // always cleanup
  }
};

// 🗑️ Delete multiple images from Cloudinary
const deleteImagesFromCloudinary = async (publicIds = []) => {
  try {
    if (!publicIds.length) return;

    const result = await cloudinary.api.delete_resources(publicIds);
    console.log(`🗑️ Deleted ${publicIds.length} images from Cloudinary`);
    return result;
  } catch (error) {
    console.error("❌ Cloudinary delete error:", error);
  }
};

export { uploadOnCloudinary, deleteImagesFromCloudinary };
