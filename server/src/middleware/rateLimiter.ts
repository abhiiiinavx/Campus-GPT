import rateLimit from "express-rate-limit";
import { sendError } from "../utils/responseFormatter.js";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per IP per window
  message:
    "Too many authentication attempts from this IP, please try again after 15 minutes.",
  handler: (req, res, next, options) => {
    return sendError(res, options.message as string, 429);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message:
    "AI query rate limit reached. Please wait a moment before sending another prompt.",
  handler: (req, res, next, options) => {
    return sendError(res, options.message as string, 429);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  message: "Too many requests, please slow down.",
  handler: (req, res, next, options) => {
    return sendError(res, options.message as string, 429);
  },
  standardHeaders: true,
  legacyHeaders: false,
});
