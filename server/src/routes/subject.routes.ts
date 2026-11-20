import { Router } from "express";
import { subjectController } from "../controllers/subject.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { UserRole } from "../types/enums.js";

const router = Router();

router.use(authenticate);

// Publicly readable for all authenticated users
router.get("/", subjectController.list.bind(subjectController));
router.get("/:id", subjectController.getById.bind(subjectController));

// Admin only mutation routes
router.post(
  "/",
  authorize(UserRole.ADMIN),
  subjectController.create.bind(subjectController),
);
router.patch(
  "/:id",
  authorize(UserRole.ADMIN),
  subjectController.update.bind(subjectController),
);
router.delete(
  "/:id",
  authorize(UserRole.ADMIN),
  subjectController.delete.bind(subjectController),
);

export default router;
