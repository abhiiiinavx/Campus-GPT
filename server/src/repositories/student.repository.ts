import prisma from "../prisma/client.js";
import { Prisma, Student } from "@prisma/client";

export class StudentRepository {
  async findByUserId(userId: string) {
    return prisma.student.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            gender: true,
            role: true,
            isActive: true,
          },
        },
        department: true,
        semester: true,
        enrollments: {
          include: {
            subject: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        department: true,
        semester: true,
      },
    });
  }

  async findByRollNumber(rollNumber: string) {
    return prisma.student.findUnique({
      where: { rollNumber },
    });
  }

  async create(data: Prisma.StudentCreateInput): Promise<Student> {
    return prisma.student.create({ data });
  }

  async listStudents(filter?: {
    departmentId?: string;
    semesterId?: string;
    search?: string;
  }) {
    return prisma.student.findMany({
      where: {
        ...(filter?.departmentId ? { departmentId: filter.departmentId } : {}),
        ...(filter?.semesterId ? { semesterId: filter.semesterId } : {}),
        ...(filter?.search
          ? {
              OR: [
                {
                  rollNumber: { contains: filter.search },
                },
                {
                  user: {
                    fullName: { contains: filter.search },
                  },
                },
                {
                  user: {
                    email: { contains: filter.search },
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            isActive: true,
          },
        },
        department: true,
        semester: true,
        enrollments: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: { rollNumber: "asc" },
    });
  }
}

export const studentRepository = new StudentRepository();
