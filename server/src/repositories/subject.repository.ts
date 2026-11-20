import prisma from "../prisma/client.js";
import { Prisma, Subject } from "@prisma/client";
import { PaginatedResult } from "../types/index.js";

export class SubjectRepository {
  async findById(id: string) {
    return prisma.subject.findUnique({
      where: { id },
      include: {
        department: true,
        semester: true,
        teachingAssignments: {
          include: {
            faculty: {
              include: {
                user: {
                  select: { id: true, fullName: true, email: true },
                },
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
            attendanceSessions: true,
          },
        },
      },
    });
  }

  async findByCode(code: string): Promise<Subject | null> {
    return prisma.subject.findUnique({
      where: { code: code.toUpperCase().trim() },
    });
  }

  async create(data: Prisma.SubjectCreateInput): Promise<Subject> {
    return prisma.subject.create({
      data: {
        ...data,
        code: data.code.toUpperCase().trim(),
      },
    });
  }

  async update(id: string, data: Prisma.SubjectUpdateInput): Promise<Subject> {
    return prisma.subject.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Subject> {
    return prisma.subject.delete({
      where: { id },
    });
  }

  async listPaginated(params: {
    page: number;
    limit: number;
    search?: string;
    departmentId?: string;
    semesterId?: string;
  }): Promise<PaginatedResult<any>> {
    const { page, limit, search, departmentId, semesterId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.SubjectWhereInput = {
      ...(departmentId ? { departmentId } : {}),
      ...(semesterId ? { semesterId } : {}),
      ...(search
        ? {
            OR: [
              { code: { contains: search } },
              { name: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.subject.count({ where }),
      prisma.subject.findMany({
        where,
        skip,
        take: limit,
        include: {
          department: true,
          semester: true,
          teachingAssignments: {
            include: {
              faculty: {
                include: {
                  user: {
                    select: { id: true, fullName: true, email: true },
                  },
                },
              },
            },
          },
          _count: {
            select: { enrollments: true },
          },
        },
        orderBy: { code: "asc" },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}

export const subjectRepository = new SubjectRepository();
