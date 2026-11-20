import { Router } from "express";
import { studentController } from "../controllers/student.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { UserRole } from "../types/enums.js";

const router = Router();

// Student-specific personal routes
router.get(
  "/me/dashboard",
  authenticate,
  authorize(UserRole.STUDENT),
  studentController.getDashboard.bind(studentController),
);

router.get(
  "/me/timetable",
  authenticate,
  authorize(UserRole.STUDENT),
  studentController.getMyTimetable.bind(studentController),
);

router.get(
  "/me/attendance",
  authenticate,
  authorize(UserRole.STUDENT),
  studentController.getMyAttendance.bind(studentController),
);

// Admin listing
router.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.FACULTY),
  studentController.listAllStudents.bind(studentController),
);

export default router;
