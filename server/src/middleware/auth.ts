import { Response, NextFunction } from "express";
import { UserRole } from "../types/enums.js";
import { AuthRequest } from "../types/index.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { sendError } from "../utils/responseFormatter.js";
import prisma from "../prisma/client.js";

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return sendError(res, "Authentication required. No token provided.", 401);
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      return sendError(res, "Invalid or expired access token.", 401);
    }

    // Verify user exists and is active in database
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        isActive: true,
        deletedAt: true,
      },
    });

    if (!user || !user.isActive || user.deletedAt) {
      return sendError(res, "User account is inactive or disabled.", 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      fullName: user.fullName,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): void | Response => {
    if (!req.user) {
      return sendError(res, "Authentication required.", 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Forbidden: Access denied for role ${req.user.role}. Allowed: [${roles.join(", ")}]`,
        403,
      );
    }

    next();
  };
};
