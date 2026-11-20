import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

// Load environment variables from .env or root .env
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  DATABASE_URL: z
    .string()
    .default(
      "postgresql://postgres:postgres@localhost:5432/campusiq?schema=public",
    ),
  JWT_ACCESS_SECRET: z
    .string()
    .default("campusiq_super_secret_access_jwt_key_development_only_12345"),
  JWT_REFRESH_SECRET: z
    .string()
    .default("campusiq_super_secret_refresh_jwt_key_development_only_67890"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_MODEL: z.string().default("gemini-1.5-flash"),
  EMBEDDING_MODEL: z.string().default("text-embedding-004"),
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  UPLOAD_DIR: z.string().default("uploads/documents"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(parsedEnv.error.format(), null, 2),
  );
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
