import fs from "fs";
import path from "path";
import { Response, NextFunction } from "express";
import { documentService } from "../services/document.service.js";
import {
  createDocumentSchema,
  updateDocumentSchema,
} from "../validators/document.validator.js";
import { sendSuccess, sendError } from "../utils/responseFormatter.js";
import { AuthRequest } from "../types/index.js";
import { DocumentCategory } from "../types/enums.js";

export class DocumentController {
  async upload(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, "Unauthenticated.", 401);
      }

      if (!req.file) {
        return sendError(res, "File is required.", 400);
      }

      const validated = createDocumentSchema.parse(req.body);
      const document = await documentService.uploadAndProcessDocument(
        req.user,
        req.file,
        validated,
      );

      return sendSuccess(
        res,
        document,
        "Document uploaded and queued for RAG processing.",
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const document = await documentService.getDocumentById(id);
      return sendSuccess(res, document, "Document details retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async download(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const document = await documentService.getDocumentById(id);

      const absolutePath = document.fileUrl
        ? path.resolve(document.fileUrl)
        : null;
      if (absolutePath && fs.existsSync(absolutePath)) {
        return res.download(absolutePath, document.fileName);
      }

      // Fallback: If physical file is not on disk (e.g. seeded document), synthesize from indexed chunks
      if (document.chunks && document.chunks.length > 0) {
        const fullText = document.chunks
          .sort((a: any, b: any) => a.chunkIndex - b.chunkIndex)
          .map((c: any) => c.content)
          .join("\n\n---\n\n");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${document.fileName || document.title + ".txt"}"`,
        );
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        return res.send(fullText);
      }

      return sendError(res, "Document file not found on server.", 404);
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { category, search } = req.query as {
        category?: DocumentCategory;
        search?: string;
      };

      const documents = await documentService.listDocuments({
        category,
        search,
      });
      return sendSuccess(res, documents, "Documents retrieved.");
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = updateDocumentSchema.parse(req.body);
      const updated = await documentService.updateDocument(id, validated);
      return sendSuccess(res, updated, "Document updated.");
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await documentService.deleteDocument(id);
      return sendSuccess(res, null, "Document deleted.");
    } catch (error) {
      next(error);
    }
  }
}

export const documentController = new DocumentController();
