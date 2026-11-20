import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import { ChatHistoryItem } from "../types/index.js";

export class GeminiProvider {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    this.init();
  }

  private init() {
    const key = env.GEMINI_API_KEY?.trim();
    if (
      key &&
      key !== "your_google_gemini_api_key_here" &&
      key !== "mock_dev_key_or_user_key" &&
      !key.startsWith("mock_")
    ) {
      this.genAI = new GoogleGenerativeAI(key);
    } else {
      this.genAI = null;
    }
  }

  isConfigured(): boolean {
    const key = env.GEMINI_API_KEY?.trim();
    return (
      !!this.genAI &&
      !!key &&
      key !== "your_google_gemini_api_key_here" &&
      key !== "mock_dev_key_or_user_key" &&
      !key.startsWith("mock_")
    );
  }

  /**
   * Generates 768-dimensional text embeddings using Google text-embedding-004
   * With deterministic vector fallback when offline / unconfigured
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const clean = text.trim();
    if (!clean) {
      return new Array(768).fill(0);
    }

    if (this.isConfigured() && this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: env.EMBEDDING_MODEL || "text-embedding-004",
        });
        const result = await model.embedContent(clean);
        const values = result.embedding?.values;
        if (values && values.length > 0) {
          return values;
        }
      } catch (err: any) {
        console.warn(
          `Gemini embedding API call failed: ${err?.message}. Falling back to deterministic vector.`,
        );
      }
    }

    return this.generateDeterministicVector(clean, 768);
  }

  /**
   * Generates multi-turn chat completions using the configured Google Gemini model
   */
  async generateChatCompletion(params: {
    message: string;
    history?: ChatHistoryItem[];
    systemInstruction?: string;
  }): Promise<string> {
    const { message, history = [], systemInstruction } = params;

    if (!this.isConfigured() || !this.genAI) {
      throw new AppError(
        "Google Gemini API Key is missing or invalid. Please configure a valid GEMINI_API_KEY in server/.env (obtain a free key from Google AI Studio: https://aistudio.google.com/app/apikey).",
        400,
      );
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: env.GEMINI_MODEL || "gemini-1.5-flash",
        systemInstruction: systemInstruction || undefined,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      });

      // Prepare multi-turn history adhering strictly to Gemini's user/model alternation
      const formattedHistory: Array<{
        role: "user" | "model";
        parts: Array<{ text: string }>;
      }> = [];

      for (const item of history) {
        const text = item.text?.trim();
        if (!text) continue;

        const role: "user" | "model" =
          item.role === "assistant" || item.role === "model"
            ? "model"
            : "user";

        // Gemini history must start with "user"
        if (formattedHistory.length === 0 && role !== "user") {
          continue;
        }

        // Avoid consecutive turns with identical role by combining text
        const last = formattedHistory[formattedHistory.length - 1];
        if (last && last.role === role) {
          last.parts[0].text += `\n${text}`;
        } else {
          formattedHistory.push({
            role,
            parts: [{ text }],
          });
        }
      }

      // If last history item is "user", pop it to let the new user message take turn
      if (
        formattedHistory.length > 0 &&
        formattedHistory[formattedHistory.length - 1].role === "user"
      ) {
        formattedHistory.pop();
      }

      const chat = model.startChat({
        history: formattedHistory,
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      const responseText = response.text();

      if (!responseText) {
        throw new AppError(
          "Gemini returned an empty response. Please rephrase your question.",
          502,
        );
      }

      return responseText;
    } catch (err: any) {
      console.error(`Gemini generation API error: ${err?.message || err}`);

      const errMsg = err?.message || String(err);
      if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("API key not valid")) {
        throw new AppError(
          "The provided GEMINI_API_KEY is invalid. Please verify your API key in server/.env.",
          401,
        );
      }
      if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("429")) {
        throw new AppError(
          "Gemini API rate limit or quota exceeded. Please wait a moment and try again.",
          429,
        );
      }
      if (errMsg.includes("SAFETY")) {
        throw new AppError(
          "Response blocked by safety filters. Please adjust your prompt.",
          400,
        );
      }

      if (err instanceof AppError) {
        throw err;
      }

      throw new AppError(
        `Gemini AI processing error: ${errMsg}`,
        502,
      );
    }
  }

  /**
   * Deterministic vector generator for offline/test environments
   */
  private generateDeterministicVector(str: string, dimensions = 768): number[] {
    const vector = new Array(dimensions).fill(0);
    const words = str.toLowerCase().split(/\W+/).filter(Boolean);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = (hash << 5) - hash + word.charCodeAt(j);
        hash |= 0;
      }
      const index = Math.abs(hash) % dimensions;
      vector[index] += 1.0;
    }

    let norm = 0;
    for (let i = 0; i < dimensions; i++) {
      norm += vector[i] * vector[i];
    }
    norm = Math.sqrt(norm);

    if (norm > 0) {
      for (let i = 0; i < dimensions; i++) {
        vector[i] /= norm;
      }
    }

    return vector;
  }
}

export const geminiProvider = new GeminiProvider();
