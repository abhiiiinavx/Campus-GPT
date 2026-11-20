import api from "./api.js";
import { ApiResponse, Notice } from "../types/index.js";

export const noticeService = {
  async listNotices(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    priority?: string;
    includeExpired?: boolean;
  }): Promise<{ items: Notice[]; pagination: any }> {
    const res = await api.get<
      ApiResponse<{ items: Notice[]; pagination: any }>
    >("/notices", {
      params,
    });
    return res.data.data;
  },

  async getNoticeById(id: string): Promise<Notice> {
    const res = await api.get<ApiResponse<Notice>>(`/notices/${id}`);
    return res.data.data;
  },

  async createNotice(data: Partial<Notice>): Promise<Notice> {
    const res = await api.post<ApiResponse<Notice>>("/notices", data);
    return res.data.data;
  },

  async updateNotice(id: string, data: Partial<Notice>): Promise<Notice> {
    const res = await api.patch<ApiResponse<Notice>>(`/notices/${id}`, data);
    return res.data.data;
  },

  async deleteNotice(id: string): Promise<void> {
    await api.delete(`/notices/${id}`);
  },
};
