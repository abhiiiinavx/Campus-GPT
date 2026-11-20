import { Request, Response, NextFunction } from "express";
import { subjectService } from "../services/subject.service.js";
import {
  createSubjectSchema,
  updateSubjectSchema,
  subjectQuerySchema,
} from "../validators/subject.validator.js";
import { sendSuccess } from "../utils/responseFormatter.js";

export class SubjectController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createSubjectSchema.parse(req.body);
      const subject = await subjectService.createSubject(validated);
      return sendSuccess(res, subject, "Subject created successfully.", 201);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const subject = await subjectService.getSubjectById(id);
      return sendSuccess(res, subject, "Subject retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = subjectQuerySchema.parse(req.query);
      const result = await subjectService.listSubjects(query);
      return sendSuccess(res, result, "Subjects retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = updateSubjectSchema.parse(req.body);
      const updated = await subjectService.updateSubject(id, validated);
      return sendSuccess(res, updated, "Subject updated successfully.");
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await subjectService.deleteSubject(id);
      return sendSuccess(res, null, "Subject deleted successfully.");
    } catch (error) {
      next(error);
    }
  }
}

export const subjectController = new SubjectController();
