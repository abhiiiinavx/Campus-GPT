import { Router } from "express";
import { attendanceController } from "../controllers/attendance.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { UserRole } from "../types/enums.js";

const router = Router();

router.use(authenticate);

// Student personal attendance
router.get(
  "/me",
  attendanceController.getMyAttendance.bind(attendanceController),
);

// Subject level attendance
router.get(
  "/subjects/:subjectId",
  attendanceController.getSubjectAttendance.bind(attendanceController),
);

// Sessions
router.get(
  "/sessions",
  attendanceController.listSessions.bind(attendanceController),
);
router.get(
  "/sessions/:id",
  attendanceController.getSessionById.bind(attendanceController),
);

router.post(
  "/sessions",
  authorize(UserRole.FACULTY, UserRole.ADMIN),
  attendanceController.createSession.bind(attendanceController),
);

// Records
router.post(
  "/records",
  authorize(UserRole.FACULTY, UserRole.ADMIN),
  attendanceController.markRecord.bind(attendanceController),
);

router.post(
  "/records/bulk",
  authorize(UserRole.FACULTY, UserRole.ADMIN),
  attendanceController.bulkMarkRecords.bind(attendanceController),
);

router.patch(
  "/records/:id",
  authorize(UserRole.FACULTY, UserRole.ADMIN),
  attendanceController.updateRecord.bind(attendanceController),
);

export default router;
