import { DayOfWeek } from "../types/enums.js";
import prisma from "../prisma/client.js";
import { facultyRepository } from "../repositories/faculty.repository.js";
import { timetableRepository } from "../repositories/timetable.repository.js";
import { noticeRepository } from "../repositories/notice.repository.js";
import { AppError } from "../middleware/errorHandler.js";

export class FacultyService {
  private getCurrentDayOfWeek(): DayOfWeek {
    const days: DayOfWeek[] = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ];
    return days[new Date().getDay()];
  }

  async getFacultyDashboard(userId: string) {
    const faculty = await facultyRepository.findByUserId(userId);
    if (!faculty) {
      throw new AppError("Faculty profile not found for this user.", 404);
    }

    const todayDay = this.getCurrentDayOfWeek();

    const [todayTimetable, allTimetable, activeNotices, recentSessions] =
      await Promise.all([
        timetableRepository.getFacultyTimetable(faculty.id, todayDay),
        timetableRepository.getFacultyTimetable(faculty.id),
        noticeRepository.getLatestActiveNotices(5),
        prisma.attendanceSession.findMany({
          where: { facultyId: faculty.id },
          take: 5,
          orderBy: { date: "desc" },
          include: {
            subject: true,
            _count: { select: { records: true } },
          },
        }),
      ]);

    const assignedSubjects = faculty.teachingAssignments.map(
      (ta) => ta.subject,
    );

    return {
      facultyProfile: {
        id: faculty.id,
        employeeId: faculty.employeeId,
        designation: faculty.designation,
        status: faculty.status,
        user: faculty.user,
      },
      department: faculty.department,
      assignedSubjects,
      todayTimetable,
      allTimetable,
      recentSessions,
      latestNotices: activeNotices,
      stats: {
        totalAssignedSubjects: assignedSubjects.length,
        classesToday: todayTimetable.length,
        totalSessionsLogged: recentSessions.length,
      },
    };
  }

  async getMyTimetable(userId: string) {
    const faculty = await facultyRepository.findByUserId(userId);
    if (!faculty) {
      throw new AppError("Faculty profile not found.", 404);
    }

    return timetableRepository.getFacultyTimetable(faculty.id);
  }
}

export const facultyService = new FacultyService();
