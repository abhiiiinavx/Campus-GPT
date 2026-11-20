import { Router } from "express";
import { noticeController } from "../controllers/notice.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { UserRole } from "../types/enums.js";

const router = Router();

router.use(authenticate);

// View notices
router.get("/", noticeController.list.bind(noticeController));
router.get("/:id", noticeController.getById.bind(noticeController));

// Notice publication and modification
router.post(
  "/",
  authorize(UserRole.ADMIN, UserRole.FACULTY),
  noticeController.create.bind(noticeController),
);
router.patch(
  "/:id",
  authorize(UserRole.ADMIN, UserRole.FACULTY),
  noticeController.update.bind(noticeController),
);
router.delete(
  "/:id",
  authorize(UserRole.ADMIN, UserRole.FACULTY),
  noticeController.delete.bind(noticeController),
);

export default router;
