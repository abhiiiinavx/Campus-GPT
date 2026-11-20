import { DayOfWeek } from "../types/enums.js";
import prisma from "../prisma/client.js";

export const timeToMinutes = (timeStr: string): number => {
  const parts = timeStr.trim().split(":");
  if (parts.length < 2) return 0;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
};

export const doTimesOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string,
): boolean => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  // Overlap if (s1 < e2 && s2 < e1). Adjacent slots like [9:00, 10:00) and [10:00, 11:00) will NOT overlap
  return s1 < e2 && s2 < e1;
};

export interface TimetableConflictCheckParams {
  excludeId?: string;
  facultyId: string;
  departmentId: string;
  semesterId: string;
  room: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface TimetableConflictResult {
  hasConflict: boolean;
  conflictType?: "FACULTY" | "ROOM" | "SEMESTER";
  message?: string;
}

export const checkTimetableConflicts = async (
  params: TimetableConflictCheckParams,
): Promise<TimetableConflictResult> => {
  const {
    excludeId,
    facultyId,
    departmentId,
    semesterId,
    room,
    dayOfWeek,
    startTime,
    endTime,
  } = params;

  // Validate start < end
  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    return {
      hasConflict: true,
      message: "Start time must be strictly before end time",
    };
  }

  // Fetch all existing entries for the same day
  const existingEntries = await prisma.timetableEntry.findMany({
    where: {
      dayOfWeek,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      OR: [
        { facultyId },
        { room: { equals: room } },
        { AND: [{ departmentId }, { semesterId }] },
      ],
    },
    include: {
      subject: true,
      faculty: { include: { user: true } },
    },
  });

  for (const entry of existingEntries) {
    if (doTimesOverlap(startTime, endTime, entry.startTime, entry.endTime)) {
      // 1. Faculty conflict check
      if (entry.facultyId === facultyId) {
        return {
          hasConflict: true,
          conflictType: "FACULTY",
          message: `Faculty member (${entry.faculty.user.fullName}) is already scheduled for "${entry.subject.name}" from ${entry.startTime} to ${entry.endTime} in room ${entry.room}.`,
        };
      }

      // 2. Room conflict check
      if (entry.room.toLowerCase() === room.toLowerCase()) {
        return {
          hasConflict: true,
          conflictType: "ROOM",
          message: `Room "${room}" is already booked for "${entry.subject.name}" from ${entry.startTime} to ${entry.endTime}.`,
        };
      }

      // 3. Semester / Class conflict check
      if (
        entry.departmentId === departmentId &&
        entry.semesterId === semesterId
      ) {
        return {
          hasConflict: true,
          conflictType: "SEMESTER",
          message: `Department/Semester is already having class "${entry.subject.name}" from ${entry.startTime} to ${entry.endTime} in room ${entry.room}.`,
        };
      }
    }
  }

  return { hasConflict: false };
};
