import { z } from "zod";

export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(4000, "Message cannot exceed 4000 characters")
    .trim(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model", "assistant"]),
        text: z.string(),
      }),
    )
    .optional()
    .default([]),
  conversationId: z.string().optional(),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
