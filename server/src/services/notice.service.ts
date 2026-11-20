import { NoticeCategory, NoticePriority, UserRole } from "../types/enums.js";
import { noticeRepository } from "../repositories/notice.repository.js";
import { AppError } from "../middleware/errorHandler.js";
import { JwtUserPayload } from "../types/index.js";

export class NoticeService {
  async createNotice(
    user: JwtUserPayload,
    data: {
      title: string;
      content: string;
      category?: NoticeCategory;
      priority?: NoticePriority;
      publishedAt?: string;
      expiresAt?: string | null;
    },
  ) {
    return noticeRepository.create({
      title: data.title,
      content: data.content,
      category: data.category || NoticeCategory.GENERAL,
      priority: data.priority || NoticePriority.MEDIUM,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      author: { connect: { id: user.id } },
    });
  }

  async getNoticeById(id: string) {
    const notice = await noticeRepository.findById(id);
    if (!notice) {
      throw new AppError("Notice not found.", 404);
    }
    return notice;
  }

  async listNotices(
    user: JwtUserPayload,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      category?: NoticeCategory;
      priority?: NoticePriority;
      includeExpired?: boolean;
    },
  ) {
    // For students, ALWAYS exclude future and expired notices
    const isStudent = user.role === UserRole.STUDENT;
    const activeOnly = isStudent || !params.includeExpired;

    return noticeRepository.listPaginated({
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search,
      category: params.category,
      priority: params.priority,
      activeOnly,
    });
  }

  async updateNotice(
    id: string,
    data: {
      title?: string;
      content?: string;
      category?: NoticeCategory;
      priority?: NoticePriority;
      publishedAt?: string;
      expiresAt?: string | null;
    },
  ) {
    const existing = await noticeRepository.findById(id);
    if (!existing) {
      throw new AppError("Notice not found.", 404);
    }

    return noticeRepository.update(id, {
      ...(data.title ? { title: data.title } : {}),
      ...(data.content ? { content: data.content } : {}),
      ...(data.category ? { category: data.category } : {}),
      ...(data.priority ? { priority: data.priority } : {}),
      ...(data.publishedAt ? { publishedAt: new Date(data.publishedAt) } : {}),
      ...(data.expiresAt !== undefined
        ? { expiresAt: data.expiresAt ? new Date(data.expiresAt) : null }
        : {}),
    });
  }

  async deleteNotice(id: string) {
    const existing = await noticeRepository.findById(id);
    if (!existing) {
      throw new AppError("Notice not found.", 404);
    }
    return noticeRepository.delete(id);
  }
}

export const noticeService = new NoticeService();
