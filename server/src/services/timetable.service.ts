import { DayOfWeek } from "../types/enums.js";
import { timetableRepository } from "../repositories/timetable.repository.js";
import { checkTimetableConflicts } from "../utils/timetableConflict.js";
import { AppError } from "../middleware/errorHandler.js";
import { studentRepository } from "../repositories/student.repository.js";
import { facultyRepository } from "../repositories/faculty.repository.js";

export class TimetableService {
  async createEntry(data: {
    subjectId: string;
    facultyId: string;
    departmentId: string;
    semesterId: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    room: string;
  }) {
    // 1. Conflict verification across faculty, room, and semester
    const conflict = await checkTimetableConflicts({
      facultyId: data.facultyId,
      departmentId: data.departmentId,
      semesterId: data.semesterId,
      room: data.room,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
    });

    if (conflict.hasConflict) {
      throw new AppError(
        conflict.message || "Timetable schedule conflict detected.",
        409,
      );
    }

    return timetableRepository.create({
      subject: { connect: { id: data.subjectId } },
      faculty: { connect: { id: data.facultyId } },
      department: { connect: { id: data.departmentId } },
      semester: { connect: { id: data.semesterId } },
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      room: data.room,
    });
  }

  async getEntryById(id: string) {
    const entry = await timetableRepository.findById(id);
    if (!entry) {
      throw new AppError("Timetable slot not found.", 404);
    }
    return entry;
  }

  async listEntries(filter?: {
    departmentId?: string;
    semesterId?: string;
    facultyId?: string;
    dayOfWeek?: DayOfWeek;
  }) {
    return timetableRepository.list(filter);
  }

  async updateEntry(
    id: string,
    data: {
      subjectId?: string;
      facultyId?: string;
      departmentId?: string;
      semesterId?: string;
      dayOfWeek?: DayOfWeek;
      startTime?: string;
      endTime?: string;
      room?: string;
    },
  ) {
    const existing = await timetableRepository.findById(id);
    if (!existing) {
      throw new AppError("Timetable slot not found.", 404);
    }

    const facultyId = data.facultyId || existing.facultyId;
    const departmentId = data.departmentId || existing.departmentId;
    const semesterId = data.semesterId || existing.semesterId;
    const room = data.room || existing.room;
    const dayOfWeek = data.dayOfWeek || existing.dayOfWeek;
    const startTime = data.startTime || existing.startTime;
    const endTime = data.endTime || existing.endTime;

    // Check conflicts excluding the current entry
    const conflict = await checkTimetableConflicts({
      excludeId: id,
      facultyId,
      departmentId,
      semesterId,
      room,
      dayOfWeek: dayOfWeek as DayOfWeek,
      startTime,
      endTime,
    });

    if (conflict.hasConflict) {
      throw new AppError(
        conflict.message || "Timetable schedule conflict detected.",
        409,
      );
    }

    return timetableRepository.update(id, {
      ...(data.subjectId
        ? { subject: { connect: { id: data.subjectId } } }
        : {}),
      ...(data.facultyId
        ? { faculty: { connect: { id: data.facultyId } } }
        : {}),
      ...(data.departmentId
        ? { department: { connect: { id: data.departmentId } } }
        : {}),
      ...(data.semesterId
        ? { semester: { connect: { id: data.semesterId } } }
        : {}),
      ...(data.dayOfWeek ? { dayOfWeek: data.dayOfWeek } : {}),
      ...(data.startTime ? { startTime: data.startTime } : {}),
      ...(data.endTime ? { endTime: data.endTime } : {}),
      ...(data.room ? { room: data.room } : {}),
    });
  }

  async deleteEntry(id: string) {
    const existing = await timetableRepository.findById(id);
    if (!existing) {
      throw new AppError("Timetable slot not found.", 404);
    }
    return timetableRepository.delete(id);
  }

  async getStudentTimetable(userId: string) {
    const student = await studentRepository.findByUserId(userId);
    if (!student) {
      throw new AppError("Student profile not found.", 404);
    }
    return timetableRepository.getStudentTimetable(
      student.departmentId,
      student.semesterId,
    );
  }

  async getFacultyTimetable(userId: string) {
    const faculty = await facultyRepository.findByUserId(userId);
    if (!faculty) {
      throw new AppError("Faculty profile not found.", 404);
    }
    return timetableRepository.getFacultyTimetable(faculty.id);
  }
}

export const timetableService = new TimetableService();
