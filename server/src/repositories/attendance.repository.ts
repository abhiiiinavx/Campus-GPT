import prisma from "../prisma/client.js";
import { AttendanceRecord, AttendanceSession, Prisma } from "@prisma/client";
import { AttendanceStatus } from "../types/enums.js";

export class AttendanceRepository {
  async createSession(
    data: Prisma.AttendanceSessionCreateInput,
  ): Promise<AttendanceSession> {
    return prisma.attendanceSession.create({
      data,
      include: {
        subject: true,
        faculty: {
          include: { user: { select: { fullName: true, email: true } } },
        },
      },
    });
  }

  async findSessionById(id: string) {
    return prisma.attendanceSession.findUnique({
      where: { id },
      include: {
        subject: true,
        faculty: {
          include: { user: { select: { fullName: true, email: true } } },
        },
        records: {
          include: {
            student: {
              include: { user: { select: { fullName: true, email: true } } },
            },
          },
        },
      },
    });
  }

  async listSessions(filter?: {
    subjectId?: string;
    facultyId?: string;
    date?: Date;
  }) {
    return prisma.attendanceSession.findMany({
      where: {
        ...(filter?.subjectId ? { subjectId: filter.subjectId } : {}),
        ...(filter?.facultyId ? { facultyId: filter.facultyId } : {}),
        ...(filter?.date ? { date: filter.date } : {}),
      },
      include: {
        subject: true,
        faculty: {
          include: { user: { select: { fullName: true, email: true } } },
        },
        records: {
          include: {
            student: {
              include: {
                user: { select: { fullName: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { date: "desc" },
    });
  }

  async createRecord(
    sessionId: string,
    studentId: string,
    status: AttendanceStatus = AttendanceStatus.PRESENT,
    remarks?: string,
  ): Promise<AttendanceRecord> {
    return prisma.attendanceRecord.upsert({
      where: {
        sessionId_studentId: { sessionId, studentId },
      },
      create: {
        sessionId,
        studentId,
        status,
        remarks,
      },
      update: {
        status,
        remarks,
      },
      include: {
        student: {
          include: { user: { select: { fullName: true, email: true } } },
        },
      },
    });
  }

  async bulkUpsertRecords(
    sessionId: string,
    records: Array<{
      studentId: string;
      status: AttendanceStatus;
      remarks?: string;
    }>,
  ) {
    return prisma.$transaction(
      records.map((rec) =>
        prisma.attendanceRecord.upsert({
          where: {
            sessionId_studentId: { sessionId, studentId: rec.studentId },
          },
          create: {
            sessionId,
            studentId: rec.studentId,
            status: rec.status,
            remarks: rec.remarks,
          },
          update: {
            status: rec.status,
            remarks: rec.remarks,
          },
        }),
      ),
    );
  }

  async updateRecord(
    id: string,
    status: AttendanceStatus,
    remarks?: string,
  ): Promise<AttendanceRecord> {
    return prisma.attendanceRecord.update({
      where: { id },
      data: { status, remarks },
      include: {
        session: { include: { subject: true } },
        student: { include: { user: true } },
      },
    });
  }

  async getStudentRawAttendance(studentId: string) {
    return prisma.attendanceRecord.findMany({
      where: { studentId },
      include: {
        session: {
          include: {
            subject: true,
            faculty: {
              include: {
                user: { select: { fullName: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: {
        session: { date: "desc" },
      },
    });
  }
}

export const attendanceRepository = new AttendanceRepository();
