import { z } from "zod";
import { NoticeCategory, NoticePriority } from "../types/enums.js";

export const createNoticeSchema = z.object({
  title: z
    .string()
    .min(3, "Notice title must be at least 3 characters")
    .max(200),
  content: z.string().min(5, "Notice content must be at least 5 characters"),
  category: z.nativeEnum(NoticeCategory).default(NoticeCategory.GENERAL),
  priority: z.nativeEnum(NoticePriority).default(NoticePriority.MEDIUM),
  publishedAt: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Invalid published date format",
    ),
  expiresAt: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Invalid expiry date format",
    ),
});

export const updateNoticeSchema = createNoticeSchema.partial();

export const noticeQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  category: z.nativeEnum(NoticeCategory).optional(),
  priority: z.nativeEnum(NoticePriority).optional(),
  includeExpired: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});
