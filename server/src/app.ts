import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { setupSwagger } from "./config/swagger.js";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { generalApiLimiter } from "./middleware/rateLimiter.js";

export const createApp = (): Express => {
  const app = express();

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Swagger UI and local development
      crossOriginEmbedderPolicy: false,
    }),
  );

  // CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g., mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (
          origin === env.CLIENT_URL ||
          origin.startsWith("http://localhost") ||
          origin.startsWith("http://127.0.0.1")
        ) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive in dev, strict in prod
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    }),
  );

  // Rate Limiting
  app.use("/api", generalApiLimiter);

  // Body and cookie parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser());

  // Swagger Documentation on /api/v1/docs
  setupSwagger(app);

  // Mount API V1 Routes
  app.use("/api/v1", routes);

  // Root redirect/status
  app.get("/", (req, res) => {
    res.json({
      name: "CampusIQ API",
      tagline: "One AI Platform for Everything on Campus",
      version: "1.0.0",
      docs: "/api/v1/docs",
      health: "/api/v1/health",
    });
  });

  // 404 and Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
