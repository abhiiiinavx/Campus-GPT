import { z } from "zod";
import { AttendanceStatus } from "../types/enums.js";

export const createSessionSchema = z.object({
  subjectId: z.string().uuid("Valid subjectId is required"),
  facultyId: z.string().uuid("Valid facultyId is required").optional(), // If not passed, extracted from authenticated faculty
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Valid date is required"),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format must be HH:mm (e.g. 09:00)"),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format must be HH:mm (e.g. 10:00)"),
  topic: z.string().optional(),
});

export const createAttendanceRecordSchema = z.object({
  sessionId: z.string().uuid("Valid sessionId is required"),
  studentId: z.string().uuid("Valid studentId is required"),
  status: z.nativeEnum(AttendanceStatus).default(AttendanceStatus.PRESENT),
  remarks: z.string().optional(),
});

export const updateAttendanceRecordSchema = z.object({
  status: z.nativeEnum(AttendanceStatus),
  remarks: z.string().optional(),
});

export const bulkMarkAttendanceSchema = z.object({
  sessionId: z.string().uuid("Valid sessionId is required"),
  records: z
    .array(
      z.object({
        studentId: z.string().uuid("Valid studentId is required"),
        status: z.nativeEnum(AttendanceStatus),
        remarks: z.string().optional(),
      }),
    )
    .min(1, "At least one student record is required"),
});
