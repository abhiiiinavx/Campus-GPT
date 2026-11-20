import api from "./api.js";
import { ApiResponse, TimetableEntry } from "../types/index.js";

export const timetableService = {
  async getStudentTimetable(): Promise<TimetableEntry[]> {
    const res = await api.get<ApiResponse<TimetableEntry[]>>(
      "/students/me/timetable",
    );
    return res.data.data;
  },

  async getFacultyTimetable(): Promise<TimetableEntry[]> {
    const res = await api.get<ApiResponse<TimetableEntry[]>>(
      "/faculty/me/timetable",
    );
    return res.data.data;
  },

  async listEntries(params?: any): Promise<TimetableEntry[]> {
    const res = await api.get<ApiResponse<TimetableEntry[]>>("/timetable", {
      params,
    });
    return res.data.data;
  },

  async createEntry(data: any): Promise<TimetableEntry> {
    const res = await api.post<ApiResponse<TimetableEntry>>("/timetable", data);
    return res.data.data;
  },

  async updateEntry(id: string, data: any): Promise<TimetableEntry> {
    const res = await api.patch<ApiResponse<TimetableEntry>>(
      `/timetable/${id}`,
      data,
    );
    return res.data.data;
  },

  async deleteEntry(id: string): Promise<void> {
    await api.delete(`/timetable/${id}`);
  },
};
