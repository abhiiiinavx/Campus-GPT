import { Response, NextFunction } from "express";
import { attendanceService } from "../services/attendance.service.js";
import {
  createSessionSchema,
  createAttendanceRecordSchema,
  updateAttendanceRecordSchema,
  bulkMarkAttendanceSchema,
} from "../validators/attendance.validator.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";
import { AuthRequest } from "../types/index.js";

export class AttendanceController {
  async createSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, "Unauthenticated.", 401);
      }

      const validated = createSessionSchema.parse(req.body);
      const session = await attendanceService.createSession(
        req.user,
        validated,
      );
      return sendSuccess(
        res,
        session,
        "Attendance session created successfully.",
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  async listSessions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { subjectId, facultyId, date } = req.query as {
        subjectId?: string;
        facultyId?: string;
        date?: string;
      };

      const sessions = await attendanceService.listSessions({
        subjectId,
        facultyId,
        date,
      });
      return sendSuccess(res, sessions, "Attendance sessions retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async getSessionById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const session = await attendanceService.getSessionById(id);
      return sendSuccess(res, session, "Attendance session retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async markRecord(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = createAttendanceRecordSchema.parse(req.body);
      const record = await attendanceService.markRecord(validated);
      return sendSuccess(res, record, "Attendance record updated.", 201);
    } catch (error) {
      next(error);
    }
  }

  async bulkMarkRecords(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = bulkMarkAttendanceSchema.parse(req.body);
      const records = await attendanceService.bulkMarkRecords(
        validated.sessionId,
        validated.records,
      );
      return sendSuccess(res, records, "Bulk attendance records updated.");
    } catch (error) {
      next(error);
    }
  }

  async updateRecord(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = updateAttendanceRecordSchema.parse(req.body);
      const record = await attendanceService.updateRecord(
        id,
        validated.status,
        validated.remarks,
      );
      return sendSuccess(res, record, "Attendance record updated.");
    } catch (error) {
      next(error);
    }
  }

  async getMyAttendance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, "Unauthenticated.", 401);
      }

      const attendance = await attendanceService.getMyAttendance(req.user.id);
      return sendSuccess(res, attendance, "Attendance summary retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async getSubjectAttendance(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.user) {
        return sendError(res, "Unauthenticated.", 401);
      }

      const { subjectId } = req.params;
      const data = await attendanceService.getSubjectAttendance(
        req.user,
        subjectId,
      );
      return sendSuccess(res, data, "Subject attendance retrieved.");
    } catch (error) {
      next(error);
    }
  }
}

export const attendanceController = new AttendanceController();
