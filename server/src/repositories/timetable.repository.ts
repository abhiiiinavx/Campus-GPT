import prisma from "../prisma/client.js";
import { Prisma, TimetableEntry } from "@prisma/client";
import { DayOfWeek } from "../types/enums.js";

export class TimetableRepository {
  async findById(id: string) {
    return prisma.timetableEntry.findUnique({
      where: { id },
      include: {
        subject: true,
        faculty: { include: { user: true } },
        department: true,
        semester: true,
      },
    });
  }

  async create(
    data: Prisma.TimetableEntryCreateInput,
  ): Promise<TimetableEntry> {
    return prisma.timetableEntry.create({
      data,
      include: {
        subject: true,
        faculty: { include: { user: true } },
        department: true,
        semester: true,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.TimetableEntryUpdateInput,
  ): Promise<TimetableEntry> {
    return prisma.timetableEntry.update({
      where: { id },
      data,
      include: {
        subject: true,
        faculty: { include: { user: true } },
        department: true,
        semester: true,
      },
    });
  }

  async delete(id: string): Promise<TimetableEntry> {
    return prisma.timetableEntry.delete({
      where: { id },
    });
  }

  async list(filter?: {
    departmentId?: string;
    semesterId?: string;
    facultyId?: string;
    dayOfWeek?: DayOfWeek;
  }) {
    return prisma.timetableEntry.findMany({
      where: {
        ...(filter?.departmentId ? { departmentId: filter.departmentId } : {}),
        ...(filter?.semesterId ? { semesterId: filter.semesterId } : {}),
        ...(filter?.facultyId ? { facultyId: filter.facultyId } : {}),
        ...(filter?.dayOfWeek ? { dayOfWeek: filter.dayOfWeek } : {}),
      },
      include: {
        subject: true,
        faculty: {
          include: {
            user: { select: { fullName: true, email: true } },
          },
        },
        department: true,
        semester: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
  }

  async getStudentTimetable(
    departmentId: string,
    semesterId: string,
    dayOfWeek?: DayOfWeek,
  ) {
    return prisma.timetableEntry.findMany({
      where: {
        departmentId,
        semesterId,
        ...(dayOfWeek ? { dayOfWeek } : {}),
      },
      include: {
        subject: true,
        faculty: {
          include: {
            user: { select: { fullName: true, email: true } },
          },
        },
        department: true,
        semester: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
  }

  async getFacultyTimetable(facultyId: string, dayOfWeek?: DayOfWeek) {
    return prisma.timetableEntry.findMany({
      where: {
        facultyId,
        ...(dayOfWeek ? { dayOfWeek } : {}),
      },
      include: {
        subject: true,
        department: true,
        semester: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
  }
}

export const timetableRepository = new TimetableRepository();
