import { Response, NextFunction } from "express";
import { studentService } from "../services/student.service.js";
import { studentRepository } from "../repositories/student.repository.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";
import { AuthRequest } from "../types/index.js";

export class StudentController {
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, "Unauthenticated.", 401);
      }

      const dashboardData = await studentService.getStudentDashboard(
        req.user.id,
      );
      return sendSuccess(
        res,
        dashboardData,
        "Student dashboard retrieved successfully.",
      );
    } catch (error) {
      next(error);
    }
  }

  async getMyAttendance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, "Unauthenticated.", 401);
      }

      const attendanceData = await studentService.getMyAttendance(req.user.id);
      return sendSuccess(res, attendanceData, "Attendance records retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async getMyTimetable(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, "Unauthenticated.", 401);
      }

      const timetableData = await studentService.getMyTimetable(req.user.id);
      return sendSuccess(res, timetableData, "Student timetable retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async listAllStudents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { departmentId, semesterId, search } = req.query as {
        departmentId?: string;
        semesterId?: string;
        search?: string;
      };

      const students = await studentRepository.listStudents({
        departmentId,
        semesterId,
        search,
      });
      return sendSuccess(res, students, "Students list retrieved.");
    } catch (error) {
      next(error);
    }
  }
}

export const studentController = new StudentController();
