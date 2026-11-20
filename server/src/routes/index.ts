import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import studentRoutes from "./student.routes.js";
import facultyRoutes from "./faculty.routes.js";
import subjectRoutes from "./subject.routes.js";
import departmentRoutes from "./department.routes.js";
import semesterRoutes from "./semester.routes.js";
import enrollmentRoutes from "./enrollment.routes.js";
import attendanceRoutes from "./attendance.routes.js";
import timetableRoutes from "./timetable.routes.js";
import noticeRoutes from "./notice.routes.js";
import documentRoutes from "./document.routes.js";
import aiRoutes from "./ai.routes.js";
import { sendSuccess } from "../utils/responseFormatter.js";
import prisma from "../prisma/client.js";

const router = Router();

// Health check endpoint
router.get("/health", async (req: Request, res: Response) => {
  let dbStatus = "healthy";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "disconnected";
  }

  return sendSuccess(
    res,
    {
      status: "ok",
      service: "CampusIQ API Service",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      database: dbStatus,
    },
    "CampusIQ API is operational.",
  );
});

// Mount modules under /api/v1/*
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/students", studentRoutes);
router.use("/student", studentRoutes);
router.use("/faculty", facultyRoutes);
router.use("/subjects", subjectRoutes);
router.use("/departments", departmentRoutes);
router.use("/semesters", semesterRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/timetable", timetableRoutes);
router.use("/notices", noticeRoutes);
router.use("/documents", documentRoutes);
router.use("/ai", aiRoutes);

export default router;
