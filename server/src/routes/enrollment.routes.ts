import { Router } from "express";
import { enrollmentController } from "../controllers/enrollment.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { UserRole } from "../types/enums.js";

const router = Router();

router.use(authenticate);

router.post("/", enrollmentController.enroll.bind(enrollmentController));
router.get("/", enrollmentController.list.bind(enrollmentController));
router.delete(
  "/:id",
  authorize(UserRole.ADMIN, UserRole.STUDENT),
  enrollmentController.delete.bind(enrollmentController),
);

export default router;
