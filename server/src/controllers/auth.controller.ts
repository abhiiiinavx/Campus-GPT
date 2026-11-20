import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import {
  signupSchema,
  loginSchema,
  refreshTokenSchema,
} from "../validators/auth.validator.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";
import { AuthRequest } from "../types/index.js";
import { env } from "../config/env.js";

const REFRESH_COOKIE_NAME = "refreshToken";

const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
};

const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
};

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = signupSchema.parse(req.body);
      const result = await authService.signup(validated);

      setRefreshTokenCookie(res, result.refreshTokenRaw);

      return sendSuccess(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        "User registered successfully.",
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await authService.login(validated);

      setRefreshTokenCookie(res, result.refreshTokenRaw);

      return sendSuccess(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        "Login successful.",
      );
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const cookieToken = req.cookies?.[REFRESH_COOKIE_NAME];
      const bodyToken = req.body?.refreshToken;
      const rawToken = cookieToken || bodyToken;

      if (!rawToken) {
        return sendError(res, "Refresh token required.", 401);
      }

      const result = await authService.refresh(rawToken);

      setRefreshTokenCookie(res, result.refreshTokenRaw);

      return sendSuccess(
        res,
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        "Access token refreshed successfully.",
      );
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const rawToken =
        req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
      await authService.logout(rawToken);

      clearRefreshTokenCookie(res);

      return sendSuccess(res, null, "Logged out successfully.");
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, "Unauthenticated.", 401);
      }

      const user = await authService.getMe(req.user.id);
      return sendSuccess(res, user, "Profile retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
