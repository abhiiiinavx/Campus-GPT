import { z } from "zod";

export const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
  phone: z.string().optional(),
  gender: z.string().optional(),
  rollNumber: z
    .string()
    .min(2, "Roll number is required for student registration")
    .optional(),
  admissionYear: z.number().int().min(2000).max(2100).optional(),
  departmentId: z.string().uuid("Valid departmentId is required").optional(),
  semesterId: z.string().uuid("Valid semesterId is required").optional(),
  // Even if client passes role, service will ALWAYS force STUDENT
  role: z.any().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});
