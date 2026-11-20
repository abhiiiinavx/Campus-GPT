export const UserRole = {
  STUDENT: 'STUDENT',
  FACULTY: 'FACULTY',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const StudentStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  GRADUATED: 'GRADUATED',
} as const;
export type StudentStatus = (typeof StudentStatus)[keyof typeof StudentStatus];

export const FacultyStatus = {
  ACTIVE: 'ACTIVE',
  ON_LEAVE: 'ON_LEAVE',
  RETIRED: 'RETIRED',
} as const;
export type FacultyStatus = (typeof FacultyStatus)[keyof typeof FacultyStatus];

export const AttendanceStatus = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE',
} as const;
export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

export const DayOfWeek = {
  MONDAY: 'MONDAY',
  TUESDAY: 'TUESDAY',
  WEDNESDAY: 'WEDNESDAY',
  THURSDAY: 'THURSDAY',
  FRIDAY: 'FRIDAY',
  SATURDAY: 'SATURDAY',
  SUNDAY: 'SUNDAY',
} as const;
export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];

export const NoticeCategory = {
  ACADEMIC: 'ACADEMIC',
  EXAM: 'EXAM',
  PLACEMENT: 'PLACEMENT',
  EVENT: 'EVENT',
  GENERAL: 'GENERAL',
  URGENT: 'URGENT',
} as const;
export type NoticeCategory = (typeof NoticeCategory)[keyof typeof NoticeCategory];

export const NoticePriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;
export type NoticePriority = (typeof NoticePriority)[keyof typeof NoticePriority];

export const DocumentCategory = {
  ACADEMIC: 'ACADEMIC',
  EXAM: 'EXAM',
  PLACEMENT: 'PLACEMENT',
  HOSTEL: 'HOSTEL',
  CAMPUS_RULES: 'CAMPUS_RULES',
  CLUBS: 'CLUBS',
  EVENTS: 'EVENTS',
  GENERAL: 'GENERAL',
} as const;
export type DocumentCategory = (typeof DocumentCategory)[keyof typeof DocumentCategory];

export const ProcessingStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;
export type ProcessingStatus = (typeof ProcessingStatus)[keyof typeof ProcessingStatus];
