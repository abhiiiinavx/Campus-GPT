import { z } from "zod";

export const createEnrollmentSchema = z.object({
  studentId: z.string().uuid("Valid studentId is required"),
  subjectId: z.string().uuid("Valid subjectId is required"),
});

export const bulkEnrollmentSchema = z.object({
  studentId: z.string().uuid("Valid studentId is required"),
  subjectIds: z
    .array(z.string().uuid())
    .min(1, "At least one subjectId is required"),
});
