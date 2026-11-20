import { DayOfWeek } from "../types/enums.js";
import prisma from "../prisma/client.js";
import { studentRepository } from "../repositories/student.repository.js";
import { attendanceRepository } from "../repositories/attendance.repository.js";
import { timetableRepository } from "../repositories/timetable.repository.js";
import { noticeRepository } from "../repositories/notice.repository.js";
import { calculateOverallAttendance } from "../utils/attendanceCalculator.js";
import { timeToMinutes } from "../utils/timetableConflict.js";
import { AppError } from "../middleware/errorHandler.js";

export class StudentService {
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

  async getStudentDashboard(userId: string) {
    const student = await studentRepository.findByUserId(userId);
    if (!student) {
      throw new AppError("Student profile not found for this user.", 404);
    }

    const todayDay = this.getCurrentDayOfWeek();
    const enrolledSubjects = student.enrollments.map((e) => e.subject);

    // Run parallel queries efficiently to avoid N+1 query performance penalties
    const [rawRecords, allTimetableEntries, activeNotices] = await Promise.all([
      attendanceRepository.getStudentRawAttendance(student.id),
      timetableRepository.getStudentTimetable(
        student.departmentId,
        student.semesterId,
      ),
      noticeRepository.getLatestActiveNotices(5),
    ]);

    // Calculate dynamic attendance
    const attendanceSummary = calculateOverallAttendance({
      records: rawRecords,
      enrolledSubjects,
    });

    const shortageSubjects = attendanceSummary.subjectsSummary.filter(
      (s) => s.isShortage,
    );

    // Filter today's timetable sorted chronologically
    const todayTimetable = allTimetableEntries
      .filter((t) => t.dayOfWeek === todayDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Calculate next class
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    let nextClass: (typeof todayTimetable)[0] | null = null;

    for (const slot of todayTimetable) {
      const slotStartMinutes = timeToMinutes(slot.startTime);
      if (slotStartMinutes > currentMinutes) {
        nextClass = slot;
        break;
      }
    }

    // Important notices
    const importantNotices = activeNotices.filter(
      (n) => n.priority === "HIGH" || n.priority === "URGENT",
    );

    return {
      studentProfile: {
        id: student.id,
        rollNumber: student.rollNumber,
        admissionYear: student.admissionYear,
        currentCGPA: student.currentCGPA,
        status: student.status,
        user: student.user,
      },
      department: student.department,
      semester: student.semester,
      enrolledSubjects: student.enrollments.map((e) => e.subject),
      attendance: {
        overallPercentage: attendanceSummary.overallPercentage,
        totalClasses: attendanceSummary.totalClasses,
        presentClasses: attendanceSummary.presentClasses,
        absentClasses: attendanceSummary.absentClasses,
        lateClasses: attendanceSummary.lateClasses,
        isShortage: attendanceSummary.isShortage,
        subjectsSummary: attendanceSummary.subjectsSummary,
      },
      shortageSubjects,
      todayTimetable,
      nextClass,
      latestNotices: activeNotices,
      importantNotices,
      quickStats: {
        totalSubjects: enrolledSubjects.length,
        attendancePercentage: attendanceSummary.overallPercentage,
        shortageCount: shortageSubjects.length,
        classesToday: todayTimetable.length,
        currentCGPA: student.currentCGPA,
      },
    };
  }

  async getMyAttendance(userId: string) {
    const student = await studentRepository.findByUserId(userId);
    if (!student) {
      throw new AppError("Student profile not found.", 404);
    }

    const enrolledSubjects = student.enrollments.map((e) => e.subject);
    const rawRecords = await attendanceRepository.getStudentRawAttendance(
      student.id,
    );

    const summary = calculateOverallAttendance({
      records: rawRecords,
      enrolledSubjects,
    });

    return {
      summary,
      rawRecords,
    };
  }

  async getMyTimetable(userId: string) {
    const student = await studentRepository.findByUserId(userId);
    if (!student) {
      throw new AppError("Student profile not found.", 404);
    }

    return timetableRepository.getStudentTimetable(
      student.departmentId,
      student.semesterId,
    );
  }
}

export const studentService = new StudentService();
