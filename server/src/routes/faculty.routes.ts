import { Router } from "express";
import { facultyController } from "../controllers/faculty.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { UserRole } from "../types/enums.js";

const router = Router();

router.get(
  "/me/dashboard",
  authenticate,
  authorize(UserRole.FACULTY),
  facultyController.getDashboard.bind(facultyController),
);

router.get(
  "/me/timetable",
  authenticate,
  authorize(UserRole.FACULTY),
  facultyController.getMyTimetable.bind(facultyController),
);

router.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.FACULTY),
  facultyController.listAllFaculty.bind(facultyController),
);

export default router;
