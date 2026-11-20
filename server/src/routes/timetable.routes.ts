import { Router } from "express";
import { timetableController } from "../controllers/timetable.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { UserRole } from "../types/enums.js";

const router = Router();

router.use(authenticate);

// Publicly readable for all logged in campus members
router.get("/", timetableController.list.bind(timetableController));
router.get("/:id", timetableController.getById.bind(timetableController));

// Admin management
router.post(
  "/",
  authorize(UserRole.ADMIN),
  timetableController.create.bind(timetableController),
);
router.patch(
  "/:id",
  authorize(UserRole.ADMIN),
  timetableController.update.bind(timetableController),
);
router.delete(
  "/:id",
  authorize(UserRole.ADMIN),
  timetableController.delete.bind(timetableController),
);

export default router;
