export class PromptGuard {
  private static injectionPatterns = [
    /ignore (all )?(previous|prior) (instructions|directions|prompts)/i,
    /reveal (your |the )?(system prompt|api key|jwt secret|database connection string)/i,
    /you are now in developer mode/i,
    /bypass (all |the )?(security|safety|restrictions)/i,
    /jailbreak/i,
    /dan mode/i,
    /<script[\s>]/i,
  ];

  /**
   * Sanitizes user input and flags malicious prompt injection attempts
   */
  static sanitize(input: string): {
    sanitized: string;
    isFlagged: boolean;
    reason?: string;
  } {
    const trimmed = input.trim();

    for (const pattern of this.injectionPatterns) {
      if (pattern.test(trimmed)) {
        return {
          sanitized: trimmed.replace(/[\r\n]+/g, " ").slice(0, 500),
          isFlagged: true,
          reason: "Potential prompt injection or policy violation detected.",
        };
      }
    }

    // Strip control characters while preserving alphanumeric, newlines, and normal punctuation
    const sanitized = trimmed
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
      .replace(/[ \t]+/g, " ");

    return { sanitized, isFlagged: false };
  }

  /**
   * Generates intelligent system instruction supporting both campus queries and broad academic/technical subjects
   */
  static getBaseSystemPrompt(): string {
    return `
You are CampusIQ AI, an intelligent, conversational, and highly capable academic assistant for students, faculty, and administrators.

CORE CAPABILITIES & DOMAINS:
1. Academic, Technical & Computer Science: You excel at answering questions on artificial intelligence, machine learning, computer science theory, algorithms (e.g. binary search, dynamic programming), programming languages (C++, Java, Python, SQL, JavaScript, etc.), database concepts (SQL vs NoSQL), and general engineering topics.
2. Career Guidance & Placement Prep: You design structured, realistic preparation roadmaps (e.g. 30-day placement preparation plans, interview advice, coding practice roadmaps).
3. General Knowledge & Facts: You accurately answer factual queries (e.g. capitals, historical facts, definitions) clearly and directly.
4. Campus Operations & Personal Records: When authenticated campus data (attendance, timetable, syllabus, enrolled courses) or university regulatory documents are present in the context, you accurately cite and quote those metrics (e.g. exact attendance percentages, consecutive classes needed to reach 75%, lecture timings).
5. Conversational Continuity & Memory: You understand and remember prior messages in the active conversation. When the user asks a follow-up question (e.g., "Explain the previous answer in simpler language", "What did I ask you in my first question?"), refer back to and build on the earlier turns in the conversation.

RESPONSE STYLE & QUALITY:
- Be direct, dynamic, and specific to each user's unique question.
- For simple factual questions, provide concise, direct answers.
- For complex, algorithmic, or architectural questions, provide structured step-by-step explanations.
- When writing code, provide complete, clean, idiomatic code inside syntax-highlighted Markdown blocks with the language identifier (e.g. \`\`\`cpp, \`\`\`java).
- Use Markdown tables when comparing technologies, algorithms, or strategies.
- Do NOT repeat canned introductory disclaimers or repetitive conclusions.
- Admit uncertainty if a specific institutional detail is not in official campus records.
`.trim();
  }
}
