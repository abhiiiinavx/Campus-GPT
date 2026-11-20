import { enrollmentRepository } from "../repositories/enrollment.repository.js";
import { studentRepository } from "../repositories/student.repository.js";
import { subjectRepository } from "../repositories/subject.repository.js";
import { AppError } from "../middleware/errorHandler.js";
import { UserRole } from "../types/enums.js";
import { JwtUserPayload } from "../types/index.js";

export class EnrollmentService {
  async enrollStudent(
    user: JwtUserPayload,
    data: { studentId: string; subjectId: string },
  ) {
    let targetStudentId = data.studentId;

    if (user.role === UserRole.STUDENT) {
      const studentProfile = await studentRepository.findByUserId(user.id);
      if (!studentProfile) {
        throw new AppError("Student profile not found.", 404);
      }
      targetStudentId = studentProfile.id;
    } else {
      const student = await studentRepository.findById(data.studentId);
      if (!student) {
        throw new AppError("Student not found.", 404);
      }
    }

    const subject = await subjectRepository.findById(data.subjectId);
    if (!subject) {
      throw new AppError("Subject not found.", 404);
    }

    const existing = await enrollmentRepository.findByStudentAndSubject(
      targetStudentId,
      data.subjectId,
    );
    if (existing) {
      throw new AppError("Student is already enrolled in this subject.", 409);
    }

    return enrollmentRepository.create(targetStudentId, data.subjectId);
  }

  async listEnrollments(
    user: JwtUserPayload,
    filter?: { subjectId?: string; studentId?: string },
  ) {
    if (user.role === UserRole.STUDENT) {
      const studentProfile = await studentRepository.findByUserId(user.id);
      if (!studentProfile) {
        throw new AppError("Student profile not found.", 404);
      }
      return enrollmentRepository.listByStudent(studentProfile.id);
    }

    return enrollmentRepository.listAll(filter);
  }

  async deleteEnrollment(user: JwtUserPayload, id: string) {
    return enrollmentRepository.delete(id);
  }
}

export const enrollmentService = new EnrollmentService();
