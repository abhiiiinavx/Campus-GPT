import { z } from "zod";
import { DayOfWeek } from "../types/enums.js";

export const createTimetableSchema = z.object({
  subjectId: z.string().uuid("Valid subjectId is required"),
  facultyId: z.string().uuid("Valid facultyId is required"),
  departmentId: z.string().uuid("Valid departmentId is required"),
  semesterId: z.string().uuid("Valid semesterId is required"),
  dayOfWeek: z.nativeEnum(DayOfWeek),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format must be HH:mm (e.g. 09:00)"),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format must be HH:mm (e.g. 10:00)"),
  room: z.string().min(1, "Room/Hall identifier is required").max(50),
});

export const updateTimetableSchema = createTimetableSchema.partial();
