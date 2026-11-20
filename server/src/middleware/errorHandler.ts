import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { sendError } from "../utils/responseFormatter.js";
import { env } from "../config/env.js";

export class AppError extends Error {
  public statusCode: number;
  public errors?: Array<{ field?: string; message: string }>;

  constructor(
    message: string,
    statusCode = 400,
    errors?: Array<{ field?: string; message: string }>,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError | ZodError | Prisma.PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): Response => {
  // 1. Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return sendError(res, "Validation failed", 400, formattedErrors);
  }

  // 2. Handle Custom AppError
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  // 3. Handle Prisma Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[]) || ["Field"];
      return sendError(
        res,
        `Duplicate entry: ${Array.isArray(target) ? target.join(", ") : target} already exists.`,
        409,
      );
    }
    if (err.code === "P2025") {
      return sendError(res, "Requested resource not found.", 404);
    }
    if (err.code === "P2003") {
      return sendError(
        res,
        "Foreign key constraint failed. Related record does not exist.",
        400,
      );
    }
  }

  // 4. Default 500 internal server error
  console.error("Unhandled Server Error:", err);
  const message =
    env.NODE_ENV === "production"
      ? "Internal server error occurred"
      : err.message || "Internal server error";

  return sendError(res, message, 500);
};

export const notFoundHandler = (req: Request, res: Response): Response => {
  return sendError(
    res,
    `Route not found: ${req.method} ${req.originalUrl}`,
    404,
  );
};
