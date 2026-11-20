import prisma from "../prisma/client.js";
import { Notice, Prisma } from "@prisma/client";
import { NoticeCategory, NoticePriority } from "../types/enums.js";
import { PaginatedResult } from "../types/index.js";

export class NoticeRepository {
  async findById(id: string) {
    return prisma.notice.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.NoticeCreateInput): Promise<Notice> {
    return prisma.notice.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.NoticeUpdateInput): Promise<Notice> {
    return prisma.notice.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<Notice> {
    return prisma.notice.delete({
      where: { id },
    });
  }

  async listPaginated(params: {
    page: number;
    limit: number;
    search?: string;
    category?: NoticeCategory;
    priority?: NoticePriority;
    activeOnly?: boolean;
  }): Promise<PaginatedResult<any>> {
    const {
      page,
      limit,
      search,
      category,
      priority,
      activeOnly = false,
    } = params;
    const skip = (page - 1) * limit;
    const now = new Date();

    const where: Prisma.NoticeWhereInput = {
      ...(category ? { category } : {}),
      ...(priority ? { priority } : {}),
      ...(activeOnly
        ? {
            publishedAt: { lte: now },
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          }
        : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { content: { contains: search } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.notice.count({ where }),
      prisma.notice.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: [{ publishedAt: "desc" }, { priority: "desc" }],
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

  async getLatestActiveNotices(limit = 5) {
    const now = new Date();
    return prisma.notice.findMany({
      where: {
        publishedAt: { lte: now },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: [{ priority: "desc" }, { publishedAt: "desc" }],
    });
  }
}

export const noticeRepository = new NoticeRepository();
