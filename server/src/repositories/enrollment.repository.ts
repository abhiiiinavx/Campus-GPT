import prisma from "../prisma/client.js";
import { Enrollment } from "@prisma/client";

export class EnrollmentRepository {
  async findByStudentAndSubject(
    studentId: string,
    subjectId: string,
  ): Promise<Enrollment | null> {
    return prisma.enrollment.findUnique({
      where: {
        studentId_subjectId: { studentId, subjectId },
      },
    });
  }

  async create(studentId: string, subjectId: string): Promise<Enrollment> {
    return prisma.enrollment.create({
      data: {
        studentId,
        subjectId,
      },
      include: {
        subject: true,
        student: {
          include: { user: true },
        },
      },
    });
  }

  async delete(id: string): Promise<Enrollment> {
    return prisma.enrollment.delete({
      where: { id },
    });
  }

  async listByStudent(studentId: string) {
    return prisma.enrollment.findMany({
      where: { studentId },
      include: {
        subject: {
          include: {
            department: true,
            semester: true,
            teachingAssignments: {
              include: {
                faculty: {
                  include: {
                    user: { select: { fullName: true, email: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });
  }

  async listAll(filter?: { subjectId?: string; studentId?: string }) {
    return prisma.enrollment.findMany({
      where: {
        ...(filter?.subjectId ? { subjectId: filter.subjectId } : {}),
        ...(filter?.studentId ? { studentId: filter.studentId } : {}),
      },
      include: {
        student: {
          include: {
            user: { select: { fullName: true, email: true, phone: true } },
            department: true,
            semester: true,
          },
        },
        subject: {
          include: {
            department: true,
            semester: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const enrollmentRepository = new EnrollmentRepository();
