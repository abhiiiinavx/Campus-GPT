import { subjectRepository } from "../repositories/subject.repository.js";
import { AppError } from "../middleware/errorHandler.js";

export class SubjectService {
  async createSubject(data: {
    code: string;
    name: string;
    description?: string;
    credits?: number;
    departmentId: string;
    semesterId: string;
  }) {
    const existing = await subjectRepository.findByCode(data.code);
    if (existing) {
      throw new AppError(
        `Subject with code "${data.code}" already exists.`,
        409,
      );
    }

    return subjectRepository.create({
      code: data.code,
      name: data.name,
      description: data.description,
      credits: data.credits || 3,
      department: { connect: { id: data.departmentId } },
      semester: { connect: { id: data.semesterId } },
    });
  }

  async getSubjectById(id: string) {
    const subject = await subjectRepository.findById(id);
    if (!subject) {
      throw new AppError("Subject not found.", 404);
    }
    return subject;
  }

  async listSubjects(params: {
    page?: number;
    limit?: number;
    search?: string;
    departmentId?: string;
    semesterId?: string;
  }) {
    return subjectRepository.listPaginated({
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search,
      departmentId: params.departmentId,
      semesterId: params.semesterId,
    });
  }

  async updateSubject(
    id: string,
    data: {
      code?: string;
      name?: string;
      description?: string;
      credits?: number;
      departmentId?: string;
      semesterId?: string;
    },
  ) {
    const existing = await subjectRepository.findById(id);
    if (!existing) {
      throw new AppError("Subject not found.", 404);
    }

    if (data.code && data.code.toUpperCase() !== existing.code) {
      const duplicate = await subjectRepository.findByCode(data.code);
      if (duplicate) {
        throw new AppError(
          `Subject with code "${data.code}" already exists.`,
          409,
        );
      }
    }

    return subjectRepository.update(id, {
      ...(data.code ? { code: data.code.toUpperCase().trim() } : {}),
      ...(data.name ? { name: data.name } : {}),
      ...(data.description !== undefined
        ? { description: data.description }
        : {}),
      ...(data.credits ? { credits: data.credits } : {}),
      ...(data.departmentId
        ? { department: { connect: { id: data.departmentId } } }
        : {}),
      ...(data.semesterId
        ? { semester: { connect: { id: data.semesterId } } }
        : {}),
    });
  }

  async deleteSubject(id: string) {
    const existing = await subjectRepository.findById(id);
    if (!existing) {
      throw new AppError("Subject not found.", 404);
    }
    return subjectRepository.delete(id);
  }
}

export const subjectService = new SubjectService();
