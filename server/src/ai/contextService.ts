import { UserRole, DayOfWeek } from "../types/enums.js";
import { studentRepository } from "../repositories/student.repository.js";
import { facultyRepository } from "../repositories/faculty.repository.js";
import { attendanceRepository } from "../repositories/attendance.repository.js";
import { timetableRepository } from "../repositories/timetable.repository.js";
import { noticeRepository } from "../repositories/notice.repository.js";
import { calculateOverallAttendance } from "../utils/attendanceCalculator.js";
import { JwtUserPayload } from "../types/index.js";

export class ContextService {
  /**
   * Retrieves current day name in enum format
   */
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

  /**
   * Builds personalized real-time context for the authenticated user
   */
  async buildUserContext(user: JwtUserPayload): Promise<{
    contextString: string;
    metadata: {
      studentProfile?: boolean;
      attendanceData?: boolean;
      timetableData?: boolean;
    };
  }> {
    const lines: string[] = [];
    const metadata: {
      studentProfile?: boolean;
      attendanceData?: boolean;
      timetableData?: boolean;
    } = {};

    lines.push(
      `CURRENT USER: ${user.fullName} (Email: ${user.email}, Role: ${user.role})`,
    );
    lines.push(
      `TODAY'S DATE: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
    );

    if (user.role === UserRole.STUDENT) {
      const student = await studentRepository.findByUserId(user.id);

      if (student) {
        metadata.studentProfile = true;
        lines.push(`\n=== STUDENT PROFILE ===`);
        lines.push(`Roll Number: ${student.rollNumber}`);
        lines.push(
          `Department: ${student.department.name} (${student.department.code})`,
        );
        lines.push(
          `Semester: Semester ${student.semester.number} (${student.semester.academicYear})`,
        );
        lines.push(`Current CGPA: ${student.currentCGPA.toFixed(2)}`);
        lines.push(`Status: ${student.status}`);

        // 1. Attendance calculation
        const enrolledSubjects = student.enrollments.map((e) => e.subject);
        const rawRecords = await attendanceRepository.getStudentRawAttendance(
          student.id,
        );
        const attendanceSummary = calculateOverallAttendance({
          records: rawRecords,
          enrolledSubjects,
        });

        metadata.attendanceData = true;
        lines.push(`\n=== STUDENT ATTENDANCE RECORDS ===`);
        lines.push(
          `Overall Attendance: ${attendanceSummary.overallPercentage}% (${attendanceSummary.presentClasses + attendanceSummary.lateClasses}/${attendanceSummary.totalClasses} classes attended). Shortage Status: ${attendanceSummary.isShortage ? "YES (Below 75%)" : "NO"}`,
        );

        lines.push(`Subject-wise Details:`);
        attendanceSummary.subjectsSummary.forEach((sub) => {
          const shortageNotice = sub.isShortage
            ? `⚠️ SHORTAGE! Must attend next ${sub.classesNeededFor75} consecutive class(es) to reach 75%.`
            : `✅ Safe. Can miss ${sub.classesCanMissToStayAbove75} class(es) and remain >= 75%.`;

          lines.push(
            `- ${sub.subjectName} (${sub.subjectCode}): ${sub.attendancePercentage}% (${sub.presentClasses + sub.lateClasses}/${sub.totalClasses} classes). ${shortageNotice}`,
          );
        });

        // 2. Timetable records for today and general week
        const todayDay = this.getCurrentDayOfWeek();
        const timetableEntries = await timetableRepository.getStudentTimetable(
          student.departmentId,
          student.semesterId,
        );

        metadata.timetableData = true;
        lines.push(`\n=== STUDENT TIMETABLE ===`);
        const todaySlots = timetableEntries.filter(
          (t) => t.dayOfWeek === todayDay,
        );
        lines.push(`Today (${todayDay}):`);
        if (todaySlots.length === 0) {
          lines.push(`  No classes scheduled for today.`);
        } else {
          todaySlots.forEach((slot) => {
            lines.push(
              `  - ${slot.startTime} - ${slot.endTime}: ${slot.subject.name} (${slot.subject.code}) in Room ${slot.room}, Faculty: ${slot.faculty.user.fullName}`,
            );
          });
        }

        // 3. Active notices summary
        const activeNotices = await noticeRepository.getLatestActiveNotices(3);
        if (activeNotices.length > 0) {
          lines.push(`\n=== ACTIVE CAMPUS NOTICES ===`);
          activeNotices.forEach((n) => {
            lines.push(
              `- [${n.priority}] ${n.title} (${n.category}): ${n.content.slice(0, 100)}...`,
            );
          });
        }
      }
    } else if (user.role === UserRole.FACULTY) {
      const faculty = await facultyRepository.findByUserId(user.id);
      if (faculty) {
        lines.push(`\n=== FACULTY PROFILE ===`);
        lines.push(`Employee ID: ${faculty.employeeId}`);
        lines.push(`Designation: ${faculty.designation}`);
        lines.push(`Department: ${faculty.department.name}`);

        const assigned = faculty.teachingAssignments.map(
          (ta) => `${ta.subject.name} (${ta.subject.code})`,
        );
        lines.push(`Assigned Subjects: ${assigned.join(", ") || "None"}`);

        const todayDay = this.getCurrentDayOfWeek();
        const timetable = await timetableRepository.getFacultyTimetable(
          faculty.id,
          todayDay,
        );
        lines.push(`Today's Teaching Schedule (${todayDay}):`);
        if (timetable.length === 0) {
          lines.push(`  No teaching slots scheduled for today.`);
        } else {
          timetable.forEach((slot) => {
            lines.push(
              `  - ${slot.startTime} - ${slot.endTime}: ${slot.subject.name} in Room ${slot.room}`,
            );
          });
        }
      }
    }

    return {
      contextString: lines.join("\n"),
      metadata,
    };
  }
}

export const contextService = new ContextService();
