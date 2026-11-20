import { Request } from "express";
export * from "./enums.js";
import { UserRole } from "./enums.js";

export interface JwtUserPayload {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface AuthRequest extends Request {
  user?: JwtUserPayload;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SubjectAttendanceSummary {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  lateClasses: number;
  attendancePercentage: number;
  isShortage: boolean;
  classesNeededFor75: number;
  classesCanMissToStayAbove75: number;
}

export interface OverallAttendanceSummary {
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  lateClasses: number;
  overallPercentage: number;
  isShortage: boolean;
  subjectsSummary: SubjectAttendanceSummary[];
}

export interface RAGSource {
  documentId: string;
  title: string;
  page?: number;
  category?: string;
  similarity?: number;
  snippet?: string;
}

export interface AIChatResponse {
  answer: string;
  sources: RAGSource[];
  contextUsed?: {
    studentProfile?: boolean;
    attendanceData?: boolean;
    timetableData?: boolean;
    documentRAG?: boolean;
  };
}
