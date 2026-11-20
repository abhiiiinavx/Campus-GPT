import prisma from "../prisma/client.js";
import { Faculty, Prisma } from "@prisma/client";

export class FacultyRepository {
  async findByUserId(userId: string) {
    return prisma.faculty.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            role: true,
            isActive: true,
          },
        },
        department: true,
        teachingAssignments: {
          include: {
            subject: {
              include: {
                semester: true,
                department: true,
                enrollments: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.faculty.findUnique({
      where: { id },
      include: {
        user: true,
        department: true,
      },
    });
  }

  async create(data: Prisma.FacultyCreateInput): Promise<Faculty> {
    return prisma.faculty.create({ data });
  }

  async listFaculty(filter?: { departmentId?: string; search?: string }) {
    return prisma.faculty.findMany({
      where: {
        ...(filter?.departmentId ? { departmentId: filter.departmentId } : {}),
        ...(filter?.search
          ? {
              OR: [
                {
                  employeeId: { contains: filter.search },
                },
                {
                  designation: { contains: filter.search },
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
        teachingAssignments: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: { employeeId: "asc" },
    });
  }
}

export const facultyRepository = new FacultyRepository();
