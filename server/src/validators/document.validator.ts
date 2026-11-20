import { z } from "zod";
import { DocumentCategory } from "../types/enums.js";

export const createDocumentSchema = z.object({
  title: z
    .string()
    .min(3, "Document title must be at least 3 characters")
    .max(200),
  description: z.string().optional(),
  category: z.nativeEnum(DocumentCategory).default(DocumentCategory.GENERAL),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  category: z.nativeEnum(DocumentCategory).optional(),
});
