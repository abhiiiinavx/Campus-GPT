import { Response, NextFunction } from "express";
import { aiService } from "../services/ai.service.js";
import { chatMessageSchema } from "../validators/ai.validator.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";
import { AuthRequest } from "../types/index.js";

export class AIController {
  async chat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(
          res,
          "Unauthenticated. JWT required for AI access.",
          401,
        );
      }

      const validated = chatMessageSchema.parse(req.body);
      const aiResponse = await aiService.processChatMessage(
        req.user,
        validated.message,
        validated.history,
      );

      return sendSuccess(
        res,
        aiResponse,
        "AI response generated successfully.",
      );
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AIController();
