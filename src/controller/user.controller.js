import { AsyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinaryUpload.js";
import validator from "validator";

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

const options = {
  httpOnly: true,
  secure: true,
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

const login = AsyncHandler(async (req, res) => {
  // 1. get login credentials from req.body
  // 2. validate the credentials
  // 3. check for user exist
  // 4. match the password
  // 5. generate access token and refresh token
  // 6. send the response

  const { email, password } = req.body;

  if (!email || validator.isEmpty(email) || !validator.isEmail(email)) {
    throw new ApiError("Please provide a valid email", 400);
  }

  if (!password) {
    throw new ApiError("Please provide password", 400);
  }

  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user) {
    throw new ApiError("User not found", 400);
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError("Password is not correct", 400);
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  console.log("\nUser logged in successfully !");

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
});

const logOut = AsyncHandler(async (req, res) => {
  // 1️⃣ Invalidate refresh token in DB (if stored)
  if (req.user?._id) {
    await User.findByIdAndUpdate(
      req.user._id,
      { $set: { refreshToken: undefined } },
      { new: true }
    );
  }

  console.log("\nUser logged out successfully !");
  // 2️⃣ Clear cookies and send response

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const deleteUser = AsyncHandler(async (req, res) => {
  // Ensure user is authenticated
  if (!req.user) {
    throw new ApiError(401, "Unauthorized request");
  }

  const userId = req.user._id;

  // Find the user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Delete the user
  await User.findByIdAndDelete(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "User deleted successfully"));
});

export { registerUser, login, logOut, deleteUser };
