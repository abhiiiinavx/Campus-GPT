import { Response, NextFunction } from "express";
import { timetableService } from "../services/timetable.service.js";
import {
  createTimetableSchema,
  updateTimetableSchema,
} from "../validators/timetable.validator.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";
import { AuthRequest } from "../types/index.js";
import { DayOfWeek } from "../types/enums.js";

export class TimetableController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = createTimetableSchema.parse(req.body);
      const entry = await timetableService.createEntry(validated);
      return sendSuccess(
        res,
        entry,
        "Timetable slot created successfully.",
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const entry = await timetableService.getEntryById(id);
      return sendSuccess(res, entry, "Timetable slot retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { departmentId, semesterId, facultyId, dayOfWeek } = req.query as {
        departmentId?: string;
        semesterId?: string;
        facultyId?: string;
        dayOfWeek?: DayOfWeek;
      };

      const entries = await timetableService.listEntries({
        departmentId,
        semesterId,
        facultyId,
        dayOfWeek,
      });
      return sendSuccess(res, entries, "Timetable entries retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = updateTimetableSchema.parse(req.body);
      const updated = await timetableService.updateEntry(id, validated);
      return sendSuccess(res, updated, "Timetable slot updated successfully.");
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await timetableService.deleteEntry(id);
      return sendSuccess(res, null, "Timetable slot deleted.");
    } catch (error) {
      next(error);
    }
  }

  async getStudentTimetable(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.user) {
        return sendError(res, "Unauthenticated.", 401);
      }
      const timetable = await timetableService.getStudentTimetable(req.user.id);
      return sendSuccess(res, timetable, "Student timetable retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async getFacultyTimetable(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.user) {
        return sendError(res, "Unauthenticated.", 401);
      }
      const timetable = await timetableService.getFacultyTimetable(req.user.id);
      return sendSuccess(res, timetable, "Faculty schedule retrieved.");
    } catch (error) {
      next(error);
    }
  }
}

export const timetableController = new TimetableController();
