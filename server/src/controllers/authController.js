import asyncHandler from "../middleware/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  registerUserService,
  loginUserService,
} from "../services/authService.js";

export const registerUser = asyncHandler(async (req, res) => {
  const user = await registerUserService(req.body);

  res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully.", user));
});

export const loginUser = asyncHandler(async (req, res) => {
  const data = await loginUserService(req.body);

  res
    .status(200)
    .json(new ApiResponse(200, "Login successful.", data));
});