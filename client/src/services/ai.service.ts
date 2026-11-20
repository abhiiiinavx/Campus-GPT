import api from "./api.js";
import { AIChatResponse, ApiResponse } from "../types/index.js";

export const aiService = {
  async sendChatMessage(
    message: string,
    history?: Array<{ role: "user" | "model" | "assistant"; text: string }>,
  ): Promise<AIChatResponse> {
    const res = await api.post<ApiResponse<AIChatResponse>>("/ai/chat", {
      message,
      history,
    });
    return res.data.data;
  },
};
