import { Router } from "express";
import { documentController } from "../controllers/document.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { uploadDocumentMiddleware } from "../middleware/upload.js";
import { UserRole } from "../types/enums.js";

const router = Router();

router.use(authenticate);

router.get("/", documentController.list.bind(documentController));
router.get("/:id/download", documentController.download.bind(documentController));
router.get("/:id", documentController.getById.bind(documentController));

// File upload and modification
router.post(
  "/",
  authorize(UserRole.ADMIN, UserRole.FACULTY),
  uploadDocumentMiddleware.single("file"),
  documentController.upload.bind(documentController),
);

router.patch(
  "/:id",
  authorize(UserRole.ADMIN, UserRole.FACULTY),
  documentController.update.bind(documentController),
);

router.delete(
  "/:id",
  authorize(UserRole.ADMIN, UserRole.FACULTY),
  documentController.delete.bind(documentController),
);

export default router;
