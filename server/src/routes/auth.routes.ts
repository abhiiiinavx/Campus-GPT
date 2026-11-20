import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post(
  "/signup",
  authRateLimiter,
  authController.signup.bind(authController),
);
router.post(
  "/login",
  authRateLimiter,
  authController.login.bind(authController),
);
router.post("/refresh", authController.refresh.bind(authController));
router.post("/logout", authController.logout.bind(authController));
router.get("/me", authenticate, authController.getMe.bind(authController));

export default router;
