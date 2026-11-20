import api from "./api.js";
import {
  ApiResponse,
  Enrollment,
  StudentDashboardData,
  Subject,
} from "../types/index.js";

export const academicService = {
  // Student Dashboard
  async getStudentDashboard(): Promise<StudentDashboardData> {
    const res = await api.get<ApiResponse<StudentDashboardData>>(
      "/students/me/dashboard",
    );
    return res.data.data;
  },

  // Faculty Dashboard
  async getFacultyDashboard(): Promise<any> {
    const res = await api.get<ApiResponse<any>>("/faculty/me/dashboard");
    return res.data.data;
  },

  // Subjects
  async listSubjects(params?: {
    search?: string;
    departmentId?: string;
    semesterId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: Subject[]; pagination: any }> {
    const res = await api.get<
      ApiResponse<{ items: Subject[]; pagination: any }>
    >("/subjects", {
      params,
    });
    return res.data.data;
  },

  async createSubject(data: Partial<Subject>): Promise<Subject> {
    const res = await api.post<ApiResponse<Subject>>("/subjects", data);
    return res.data.data;
  },

  async updateSubject(id: string, data: Partial<Subject>): Promise<Subject> {
    const res = await api.patch<ApiResponse<Subject>>(`/subjects/${id}`, data);
    return res.data.data;
  },

  async deleteSubject(id: string): Promise<void> {
    await api.delete(`/subjects/${id}`);
  },

  // Enrollments
  async listEnrollments(params?: {
    subjectId?: string;
    studentId?: string;
  }): Promise<Enrollment[]> {
    const res = await api.get<ApiResponse<Enrollment[]>>("/enrollments", {
      params,
    });
    return res.data.data;
  },

  async enroll(data: {
    studentId: string;
    subjectId: string;
  }): Promise<Enrollment> {
    const res = await api.post<ApiResponse<Enrollment>>("/enrollments", data);
    return res.data.data;
  },

  async deleteEnrollment(id: string): Promise<void> {
    await api.delete(`/enrollments/${id}`);
  },

  // Students & Faculty admin lists
  async listStudents(params?: any): Promise<any[]> {
    const res = await api.get<ApiResponse<any[]>>("/students", { params });
    return res.data.data;
  },

  async listFaculty(params?: any): Promise<any[]> {
    const res = await api.get<ApiResponse<any[]>>("/faculty", { params });
    return res.data.data;
  },

  // Users Directory
  async listUsers(params?: { role?: string; search?: string }): Promise<any[]> {
    const res = await api.get<ApiResponse<any[]>>("/users", { params });
    return res.data.data;
  },

  async toggleUserStatus(id: string): Promise<any> {
    const res = await api.patch<ApiResponse<any>>(`/users/${id}/status`);
    return res.data.data;
  },

  // Departments and Semesters
  async listDepartments(): Promise<any[]> {
    const res = await api.get<ApiResponse<any[]>>("/departments");
    return res.data.data;
  },

  async listSemesters(): Promise<any[]> {
    const res = await api.get<ApiResponse<any[]>>("/semesters");
    return res.data.data;
  },
};
