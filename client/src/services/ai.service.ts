import api from "./api.js";
import { AIChatResponse, ApiResponse } from "../types/index.js";

export const aiService = {
  async sendChatMessage(message: string): Promise<AIChatResponse> {
    const res = await api.post<ApiResponse<AIChatResponse>>("/ai/chat", {
      message,
    });
    return res.data.data;
  },
};
