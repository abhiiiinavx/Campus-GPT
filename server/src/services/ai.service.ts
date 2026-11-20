import { geminiProvider } from "../ai/geminiProvider.js";
import { ragService } from "../ai/ragService.js";
import { contextService } from "../ai/contextService.js";
import { PromptGuard } from "../ai/promptGuard.js";
import { AIChatResponse, JwtUserPayload } from "../types/index.js";
import { AppError } from "../middleware/errorHandler.js";

export class AIService {
  async processChatMessage(
    user: JwtUserPayload,
    message: string,
  ): Promise<AIChatResponse> {
    // 1. Sanitize input & check for prompt injection
    const { sanitized, isFlagged } = PromptGuard.sanitize(message);
    if (isFlagged) {
      return {
        answer:
          "Your message contains patterns that violate academic safety guidelines. Please ask a direct question regarding campus courses, attendance, timetables, or university documents.",
        sources: [],
      };
    }

    if (!sanitized) {
      throw new AppError("Message content cannot be empty.", 400);
    }

    // 2. Fetch authenticated real-time campus & student context
    const { contextString: userContext, metadata } =
      await contextService.buildUserContext(user);

    // 3. Perform RAG semantic search across campus document knowledge base
    const { contextText: ragContext, sources } =
      await ragService.retrieveContext(sanitized, 4, 0.25);

    // 4. Assemble the grounded prompt
    const baseSystemPrompt = PromptGuard.getBaseSystemPrompt();

    const fullPrompt = `
=== AUTHENTICATED USER & LIVE CAMPUS CONTEXT ===
${userContext}

=== UNIVERSITY DOCUMENT KNOWLEDGE BASE (RAG) ===
${ragContext ? ragContext : "No specific document excerpts matched this query."}

=== USER QUERY ===
"${sanitized}"

=== INSTRUCTIONS ===
Based ONLY on the Authenticated Campus Context and the Document Knowledge Base above, provide a factual, helpful, and concise answer to the student/faculty query.
- If the user asks about attendance, calculate or quote the exact numbers provided in their records (e.g. classes needed to reach 75%).
- If the user asks about timetable/schedule, refer to their specific slots.
- If referencing documents, mention the document title.
- If the required information is not in the context, politely state that it is not available in official campus records.
`.trim();

    try {
      const answer = await geminiProvider.generateCompletion(
        fullPrompt,
        baseSystemPrompt,
      );

      return {
        answer,
        sources,
        contextUsed: {
          studentProfile: metadata.studentProfile,
          attendanceData: metadata.attendanceData,
          timetableData: metadata.timetableData,
          documentRAG: sources.length > 0,
        },
      };
    } catch (err: any) {
      console.error(`AI Chat processing error: ${err?.message}`);
      return {
        answer:
          "I encountered a temporary error while processing your request. Based on your records, you can view your real-time attendance and schedule directly on your dashboard.",
        sources: [],
      };
    }
  }
}

export const aiService = new AIService();
