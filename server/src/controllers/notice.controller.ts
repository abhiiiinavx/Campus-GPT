import { Response, NextFunction } from "express";
import { noticeService } from "../services/notice.service.js";
import {
  createNoticeSchema,
  updateNoticeSchema,
  noticeQuerySchema,
} from "../validators/notice.validator.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";
import { AuthRequest } from "../types/index.js";

export class NoticeController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, "Unauthenticated.", 401);
      }

      const validated = createNoticeSchema.parse(req.body);
      const notice = await noticeService.createNotice(req.user, validated);
      return sendSuccess(res, notice, "Notice published successfully.", 201);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const notice = await noticeService.getNoticeById(id);
      return sendSuccess(res, notice, "Notice retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, "Unauthenticated.", 401);
      }

      const query = noticeQuerySchema.parse(req.query);
      const result = await noticeService.listNotices(req.user, query);
      return sendSuccess(res, result, "Notices retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = updateNoticeSchema.parse(req.body);
      const updated = await noticeService.updateNotice(id, validated);
      return sendSuccess(res, updated, "Notice updated successfully.");
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await noticeService.deleteNotice(id);
      return sendSuccess(res, null, "Notice deleted.");
    } catch (error) {
      next(error);
    }
  }
}

export const noticeController = new NoticeController();
