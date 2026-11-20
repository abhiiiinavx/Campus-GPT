import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { UserRole } from "../types/enums.js";

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.get("/", userController.listUsers.bind(userController));
router.patch("/:id/status", userController.toggleStatus.bind(userController));
router.delete("/:id", userController.deleteUser.bind(userController));

export default router;
