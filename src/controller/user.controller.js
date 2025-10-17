import { AsyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinaryUpload.js";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // “Just save the changes, don’t run full validation on every field.”

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token generation error:", error);
    throw new ApiError("Error generating tokens", 500);
  }
};

const registerUser = AsyncHandler(async (req, res) => {
  // 1️⃣ Destructure fields
  const { fullName, userName, email, password, role = "user" } = req.body;
  const avatarLocalPath = req.file.path;

  const requiredFields = ["fullName", "userName", "email", "password"];

  // 2️⃣ Validate required fields
  for (const field of requiredFields) {
    if (!req.body[field] || req.body[field].trim() === "") {
      return res
        .status(400)
        .json(new ApiResponse(400, [], `Please provide ${field}`));
    }
  }

  if (!avatarLocalPath) throw new ApiError(400, "Avatar is required");

  // 3️⃣ Check if user already exists (email or username)
  const existingUser = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (existingUser) {
    throw new ApiError("User with this email or username already exists", 400);
  }

  // 4️⃣ Upload images to Cloudinary and check avatar response

  const avatarResponse = await uploadOnCloudinary(avatarLocalPath);

  if (!avatarResponse) {
    throw new ApiError("Failed to upload avatar on Cloudinary", 400);
  }

  const avatar = {
    public_id: avatarResponse.public_id,
    url: avatarResponse.url,
  };

  // 5️⃣ Create new user
  const newUser = await User.create({
    fullName,
    userName: userName.toLowerCase(),
    email: email.toLowerCase(),
    password,
    avatar,
    role,
  });

  if (!newUser) {
    throw new ApiError(500, "Error while creating user");
  }

  // 6️⃣ Exclude password field before sending response
  const userWithoutPassword = await User.findById(newUser._id).select(
    "-password"
  );

  // 7️⃣ Send success response
  return res
    .status(201)
    .json(
      new ApiResponse(201, userWithoutPassword, "User registered successfully")
    );
});

export { registerUser };
