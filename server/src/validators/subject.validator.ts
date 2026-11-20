import { z } from "zod";

export const createSubjectSchema = z.object({
  code: z.string().min(2, "Subject code must be at least 2 characters").max(20),
  name: z
    .string()
    .min(2, "Subject name must be at least 2 characters")
    .max(100),
  description: z.string().optional(),
  credits: z.number().int().min(1).max(10).default(3),
  departmentId: z.string().uuid("Valid departmentId is required"),
  semesterId: z.string().uuid("Valid semesterId is required"),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const subjectQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  departmentId: z.string().optional(),
  semesterId: z.string().optional(),
});
