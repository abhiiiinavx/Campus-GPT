export type UserRole = "STUDENT" | "FACULTY" | "ADMIN";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  gender?: string;
  isActive?: boolean;
  student?: StudentProfile;
  faculty?: FacultyProfile;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface Semester {
  id: string;
  number: number;
  academicYear: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface StudentProfile {
  id: string;
  userId: string;
  departmentId: string;
  semesterId: string;
  rollNumber: string;
  admissionYear: number;
  currentCGPA: number;
  status: "ACTIVE" | "SUSPENDED" | "GRADUATED";
  department?: Department;
  semester?: Semester;
  user?: User;
}

export interface FacultyProfile {
  id: string;
  userId: string;
  departmentId: string;
  employeeId: string;
  designation: string;
  status: "ACTIVE" | "ON_LEAVE" | "RETIRED";
  department?: Department;
  user?: User;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  description?: string;
  credits: number;
  departmentId: string;
  semesterId: string;
  department?: Department;
  semester?: Semester;
  teachingAssignments?: Array<{
    faculty: {
      user: {
        fullName: string;
        email: string;
      };
    };
  }>;
}

export interface Enrollment {
  id: string;
  studentId: string;
  subjectId: string;
  enrolledAt: string;
  subject: Subject;
  student?: StudentProfile;
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

export interface AttendanceSession {
  id: string;
  subjectId: string;
  facultyId: string;
  date: string;
  startTime: string;
  endTime: string;
  topic?: string;
  subject?: Subject;
  records?: Array<{
    id: string;
    studentId: string;
    status: "PRESENT" | "ABSENT" | "LATE";
    remarks?: string;
    student?: { user: { fullName: string; email: string } };
  }>;
}

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface TimetableEntry {
  id: string;
  subjectId: string;
  facultyId: string;
  departmentId: string;
  semesterId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string;
  subject: Subject;
  department?: Department;
  semester?: Semester;
  faculty: {
    user: {
      fullName: string;
      email: string;
    };
  };
}

export type NoticeCategory =
  "ACADEMIC" | "EXAM" | "PLACEMENT" | "EVENT" | "GENERAL" | "URGENT";

export type NoticePriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  priority: NoticePriority;
  publishedAt: string;
  expiresAt?: string | null;
  createdBy: string;
  author: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
  };
}

export type DocumentCategory =
  | "ACADEMIC"
  | "EXAM"
  | "PLACEMENT"
  | "HOSTEL"
  | "CAMPUS_RULES"
  | "CLUBS"
  | "EVENTS"
  | "GENERAL";

export interface DocumentItem {
  id: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
  processingStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
  uploader?: {
    fullName: string;
    email: string;
  };
  _count?: {
    chunks: number;
  };
}

export interface StudentDashboardData {
  studentProfile: StudentProfile;
  department: Department;
  semester: Semester;
  enrolledSubjects: Subject[];
  attendance: OverallAttendanceSummary;
  shortageSubjects: SubjectAttendanceSummary[];
  todayTimetable: TimetableEntry[];
  nextClass: TimetableEntry | null;
  latestNotices: Notice[];
  importantNotices: Notice[];
  quickStats: {
    totalSubjects: number;
    attendancePercentage: number;
    shortageCount: number;
    classesToday: number;
    currentCGPA: number;
  };
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

export interface AIChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  sources?: RAGSource[];
  timestamp: string;
  isStreaming?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: Array<{ field?: string; message: string }>;
}
