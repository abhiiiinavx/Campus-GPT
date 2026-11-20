import { Router } from "express";
import { aiController } from "../controllers/ai.controller.js";
import { authenticate } from "../middleware/auth.js";
import { aiRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// AI Chat requires authentication and applies rate limiting
router.post(
  "/chat",
  authenticate,
  aiRateLimiter,
  aiController.chat.bind(aiController),
);

export default router;
