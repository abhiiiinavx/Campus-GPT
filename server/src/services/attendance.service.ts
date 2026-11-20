import { AttendanceStatus, UserRole } from "../types/enums.js";
import { attendanceRepository } from "../repositories/attendance.repository.js";
import { facultyRepository } from "../repositories/faculty.repository.js";
import { studentRepository } from "../repositories/student.repository.js";
import { subjectRepository } from "../repositories/subject.repository.js";
import {
  calculateOverallAttendance,
  calculateSubjectAttendance,
} from "../utils/attendanceCalculator.js";
import { AppError } from "../middleware/errorHandler.js";
import { JwtUserPayload } from "../types/index.js";
import prisma from "../prisma/client.js";

export class AttendanceService {
  async createSession(
    user: JwtUserPayload,
    data: {
      subjectId: string;
      facultyId?: string;
      date: string;
      startTime: string;
      endTime: string;
      topic?: string;
    },
  ) {
    let facultyId = data.facultyId;

    if (user.role === UserRole.FACULTY) {
      const faculty = await facultyRepository.findByUserId(user.id);
      if (!faculty) {
        throw new AppError("Faculty profile not found for user.", 404);
      }
      facultyId = faculty.id;
    }

    if (!facultyId) {
      throw new AppError(
        "facultyId is required to create an attendance session.",
        400,
      );
    }

    const subject = await subjectRepository.findById(data.subjectId);
    if (!subject) {
      throw new AppError("Subject not found.", 404);
    }

    return attendanceRepository.createSession({
      subject: { connect: { id: data.subjectId } },
      faculty: { connect: { id: facultyId } },
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      topic: data.topic,
    });
  }

  async getSessionById(id: string) {
    const session = await attendanceRepository.findSessionById(id);
    if (!session) {
      throw new AppError("Attendance session not found.", 404);
    }
    return session;
  }

  async listSessions(filter?: {
    subjectId?: string;
    facultyId?: string;
    date?: string;
  }) {
    return attendanceRepository.listSessions({
      subjectId: filter?.subjectId,
      facultyId: filter?.facultyId,
      date: filter?.date ? new Date(filter.date) : undefined,
    });
  }

  async markRecord(data: {
    sessionId: string;
    studentId: string;
    status: AttendanceStatus;
    remarks?: string;
  }) {
    const session = await attendanceRepository.findSessionById(data.sessionId);
    if (!session) {
      throw new AppError("Attendance session not found.", 404);
    }

    const student = await studentRepository.findById(data.studentId);
    if (!student) {
      throw new AppError("Student not found.", 404);
    }

    return attendanceRepository.createRecord(
      data.sessionId,
      data.studentId,
      data.status,
      data.remarks,
    );
  }

  async bulkMarkRecords(
    sessionId: string,
    records: Array<{
      studentId: string;
      status: AttendanceStatus;
      remarks?: string;
    }>,
  ) {
    const session = await attendanceRepository.findSessionById(sessionId);
    if (!session) {
      throw new AppError("Attendance session not found.", 404);
    }

    return attendanceRepository.bulkUpsertRecords(sessionId, records);
  }

  async updateRecord(id: string, status: AttendanceStatus, remarks?: string) {
    return attendanceRepository.updateRecord(id, status, remarks);
  }

  async getMyAttendance(userId: string) {
    const student = await studentRepository.findByUserId(userId);
    if (!student) {
      throw new AppError("Student record not found.", 404);
    }

    const enrolledSubjects = student.enrollments.map((e) => e.subject);
    const rawRecords = await attendanceRepository.getStudentRawAttendance(
      student.id,
    );

    const summary = calculateOverallAttendance({
      records: rawRecords,
      enrolledSubjects,
    });

    return {
      summary,
      rawRecords,
    };
  }

  async getSubjectAttendance(user: JwtUserPayload, subjectId: string) {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) {
      throw new AppError("Subject not found.", 404);
    }

    if (user.role === UserRole.STUDENT) {
      const student = await studentRepository.findByUserId(user.id);
      if (!student) {
        throw new AppError("Student profile not found.", 404);
      }

      const records = await prisma.attendanceRecord.findMany({
        where: {
          studentId: student.id,
          session: { subjectId },
        },
        include: {
          session: {
            include: {
              faculty: { include: { user: { select: { fullName: true } } } },
            },
          },
        },
        orderBy: { session: { date: "desc" } },
      });

      const summary = calculateSubjectAttendance(subject, records as any);
      return { summary, records };
    }

    // Faculty or Admin: Return all attendance records and stats for all enrolled students in this subject
    const enrollments = await prisma.enrollment.findMany({
      where: { subjectId },
      include: {
        student: {
          include: {
            user: { select: { fullName: true, email: true } },
          },
        },
      },
    });

    const sessions = await prisma.attendanceSession.findMany({
      where: { subjectId },
      include: {
        records: true,
      },
      orderBy: { date: "desc" },
    });

    const studentReports = enrollments.map((enroll) => {
      const studentRecords = sessions.flatMap((sess) =>
        sess.records.filter((r) => r.studentId === enroll.student.id),
      );
      const summary = calculateSubjectAttendance(
        subject,
        studentRecords as any,
      );
      return {
        student: enroll.student,
        summary,
      };
    });

    return {
      subject,
      totalSessions: sessions.length,
      studentReports,
    };
  }
}

export const attendanceService = new AttendanceService();
