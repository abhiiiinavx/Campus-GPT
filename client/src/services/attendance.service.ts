import api from "./api.js";
import {
  ApiResponse,
  AttendanceSession,
  OverallAttendanceSummary,
} from "../types/index.js";

export const attendanceService = {
  async getMyAttendance(): Promise<{
    summary: OverallAttendanceSummary;
    rawRecords: any[];
  }> {
    const res =
      await api.get<
        ApiResponse<{ summary: OverallAttendanceSummary; rawRecords: any[] }>
      >("/attendance/me");
    return res.data.data;
  },

  async getSubjectAttendance(subjectId: string): Promise<any> {
    const res = await api.get<ApiResponse<any>>(
      `/attendance/subjects/${subjectId}`,
    );
    return res.data.data;
  },

  async listSessions(params?: {
    subjectId?: string;
    facultyId?: string;
    date?: string;
  }): Promise<AttendanceSession[]> {
    const res = await api.get<ApiResponse<AttendanceSession[]>>(
      "/attendance/sessions",
      {
        params,
      },
    );
    return res.data.data;
  },

  async createSession(data: {
    subjectId: string;
    facultyId?: string;
    date: string;
    startTime: string;
    endTime: string;
    topic?: string;
  }): Promise<AttendanceSession> {
    const res = await api.post<ApiResponse<AttendanceSession>>(
      "/attendance/sessions",
      data,
    );
    return res.data.data;
  },

  async markBulkAttendance(data: {
    sessionId: string;
    records: Array<{
      studentId: string;
      status: "PRESENT" | "ABSENT" | "LATE";
      remarks?: string;
    }>;
  }): Promise<any> {
    const res = await api.post<ApiResponse<any>>(
      "/attendance/records/bulk",
      data,
    );
    return res.data.data;
  },

  async updateRecord(
    id: string,
    status: string,
    remarks?: string,
  ): Promise<any> {
    const res = await api.patch<ApiResponse<any>>(`/attendance/records/${id}`, {
      status,
      remarks,
    });
    return res.data.data;
  },
};
