import { Response } from "express";
import { ApiResponse } from "../types/index.js";

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message = "Operation successful",
  statusCode = 200,
): Response => {
  const responseBody: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(responseBody);
};

export const sendError = (
  res: Response,
  message = "An error occurred",
  statusCode = 400,
  errors?: Array<{ field?: string; message: string }>,
): Response => {
  const responseBody: ApiResponse = {
    success: false,
    message,
    errors: errors && errors.length > 0 ? errors : [{ message }],
  };
  return res.status(statusCode).json(responseBody);
};
