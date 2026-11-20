import api from "./api.js";
import { ApiResponse, DocumentItem } from "../types/index.js";

export const documentService = {
  async listDocuments(params?: {
    category?: string;
    search?: string;
  }): Promise<DocumentItem[]> {
    const res = await api.get<ApiResponse<DocumentItem[]>>("/documents", {
      params,
    });
    return res.data.data;
  },

  async getDocumentById(id: string): Promise<DocumentItem> {
    const res = await api.get<ApiResponse<DocumentItem>>(`/documents/${id}`);
    return res.data.data;
  },

  async uploadDocument(formData: FormData): Promise<DocumentItem> {
    const res = await api.post<ApiResponse<DocumentItem>>(
      "/documents",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return res.data.data;
  },

  async updateDocument(
    id: string,
    data: Partial<DocumentItem>,
  ): Promise<DocumentItem> {
    const res = await api.patch<ApiResponse<DocumentItem>>(
      `/documents/${id}`,
      data,
    );
    return res.data.data;
  },

  async deleteDocument(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },
};
