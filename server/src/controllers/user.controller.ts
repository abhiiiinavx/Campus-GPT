import { Response, NextFunction } from "express";
import { userRepository } from "../repositories/user.repository.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";
import { AuthRequest } from "../types/index.js";
import { UserRole } from "../types/enums.js";

export class UserController {
  async listUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { role, search } = req.query as {
        role?: UserRole;
        search?: string;
      };

      const users = await userRepository.listUsers(role, search);
      return sendSuccess(res, users, "Users retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  async toggleStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userRepository.findById(id);
      if (!user) {
        return sendError(res, "User not found.", 404);
      }

      const updated = await userRepository.update(id, {
        isActive: !user.isActive,
      });

      return sendSuccess(
        res,
        updated,
        `User ${updated.isActive ? "activated" : "deactivated"} successfully.`,
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userRepository.findById(id);
      if (!user) {
        return sendError(res, "User not found.", 404);
      }

      await userRepository.update(id, {
        deletedAt: new Date(),
      });

      return sendSuccess(res, null, "User removed successfully.");
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
