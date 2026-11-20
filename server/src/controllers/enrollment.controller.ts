import { Response, NextFunction } from "express";
import { enrollmentService } from "../services/enrollment.service.js";
import { createEnrollmentSchema } from "../validators/enrollment.validator.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";
import { AuthRequest } from "../types/index.js";

export class EnrollmentController {
  async enroll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, "Unauthenticated.", 401);
      }

      const validated = createEnrollmentSchema.parse(req.body);
      const enrollment = await enrollmentService.enrollStudent(
        req.user,
        validated,
      );
      return sendSuccess(
        res,
        enrollment,
        "Enrolled in subject successfully.",
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, "Unauthenticated.", 401);
      }

      const { subjectId, studentId } = req.query as {
        subjectId?: string;
        studentId?: string;
      };

      const enrollments = await enrollmentService.listEnrollments(req.user, {
        subjectId,
        studentId,
      });
      return sendSuccess(res, enrollments, "Enrollments retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, "Unauthenticated.", 401);
      }

      const { id } = req.params;
      await enrollmentService.deleteEnrollment(req.user, id);
      return sendSuccess(res, null, "Enrollment removed successfully.");
    } catch (error) {
      next(error);
    }
  }
}

export const enrollmentController = new EnrollmentController();
