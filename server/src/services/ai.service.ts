import { geminiProvider } from "../ai/geminiProvider.js";
import { ragService } from "../ai/ragService.js";
import { contextService } from "../ai/contextService.js";
import { PromptGuard } from "../ai/promptGuard.js";
import { AIChatResponse, ChatHistoryItem, JwtUserPayload, RAGSource } from "../types/index.js";
import { AppError } from "../middleware/errorHandler.js";

export class AIService {
  async processChatMessage(
    user: JwtUserPayload,
    message: string,
    history: ChatHistoryItem[] = [],
  ): Promise<AIChatResponse> {
    // 1. Sanitize input & check for prompt injection
    const { sanitized, isFlagged } = PromptGuard.sanitize(message);
    if (isFlagged) {
      return {
        answer:
          "Your message contains patterns that violate academic safety guidelines. Please ask a direct question regarding campus courses, attendance, timetables, programming, or university studies.",
        sources: [],
      };
    }

    if (!sanitized) {
      throw new AppError("Message content cannot be empty.", 400);
    }

    // 2. Determine query intent
    const lower = sanitized.toLowerCase();
    const isCampusSpecific =
      lower.includes("attendance") ||
      lower.includes("timetable") ||
      lower.includes("schedule") ||
      lower.includes("class") ||
      lower.includes("notice") ||
      lower.includes("syllabus") ||
      lower.includes("document") ||
      lower.includes("ordinance") ||
      lower.includes("rule") ||
      lower.includes("policy") ||
      lower.includes("cgpa") ||
      lower.includes("grade") ||
      lower.includes("faculty") ||
      lower.includes("prof") ||
      lower.includes("abes") ||
      lower.includes("department") ||
      lower.includes("semester") ||
      lower.includes("subject");

    // 3. Fetch authenticated user context and RAG documents if campus-relevant
    let userContext = "";
    let metadata: {
      studentProfile?: boolean;
      attendanceData?: boolean;
      timetableData?: boolean;
    } = {};
    let ragContext = "";
    let sources: RAGSource[] = [];

    if (isCampusSpecific) {
      const userCtx = await contextService.buildUserContext(user);
      userContext = userCtx.contextString;
      metadata = userCtx.metadata;

      const rag = await ragService.retrieveContext(sanitized, 4, 0.25);
      ragContext = rag.contextText;
      sources = rag.sources;
    }

    // 4. Assemble context-aware instruction
    const baseSystemPrompt = PromptGuard.getBaseSystemPrompt();

    // Prepare prompt payload for Gemini
    let promptToSend = sanitized;
    if (userContext || ragContext) {
      promptToSend = `
[AUTHENTICATED USER & CAMPUS CONTEXT]
${userContext || "None"}

[CAMPUS KNOWLEDGE BASE (RAG EXCERPTS)]
${ragContext || "No specific documents matched this query."}

[USER QUESTION]
${sanitized}
`.trim();
    }

    // 5. Generate completion using Gemini with multi-turn conversation memory
    const answer = await geminiProvider.generateChatCompletion({
      message: promptToSend,
      history,
      systemInstruction: baseSystemPrompt,
    });

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
  }
}

export const aiService = new AIService();
