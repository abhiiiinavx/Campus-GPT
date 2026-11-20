import { Response, NextFunction } from "express";
import { facultyService } from "../services/faculty.service.js";
import { facultyRepository } from "../repositories/faculty.repository.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";
import { AuthRequest } from "../types/index.js";

export class FacultyController {
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, "Unauthenticated.", 401);
      }

      const dashboardData = await facultyService.getFacultyDashboard(
        req.user.id,
      );
      return sendSuccess(
        res,
        dashboardData,
        "Faculty dashboard retrieved successfully.",
      );
    } catch (error) {
      next(error);
    }
  }

  async getMyTimetable(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, "Unauthenticated.", 401);
      }

      const timetable = await facultyService.getMyTimetable(req.user.id);
      return sendSuccess(res, timetable, "Faculty schedule retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async listAllFaculty(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { departmentId, search } = req.query as {
        departmentId?: string;
        search?: string;
      };

      const facultyList = await facultyRepository.listFaculty({
        departmentId,
        search,
      });
      return sendSuccess(res, facultyList, "Faculty members list retrieved.");
    } catch (error) {
      next(error);
    }
  }
}

export const facultyController = new FacultyController();
