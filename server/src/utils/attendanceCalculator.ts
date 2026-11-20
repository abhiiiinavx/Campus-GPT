import { AttendanceRecord, AttendanceSession, Subject } from "@prisma/client";
import { AttendanceStatus } from "../types/enums.js";
import {
  OverallAttendanceSummary,
  SubjectAttendanceSummary,
} from "../types/index.js";

interface RawAttendanceData {
  records: (AttendanceRecord & {
    session: AttendanceSession & {
      subject: Subject;
    };
  })[];
  enrolledSubjects: Subject[];
}

export const calculateSubjectAttendance = (
  subject: Subject,
  recordsForSubject: AttendanceRecord[],
): SubjectAttendanceSummary => {
  const totalClasses = recordsForSubject.length;
  let presentClasses = 0;
  let absentClasses = 0;
  let lateClasses = 0;

  recordsForSubject.forEach((rec) => {
    if (rec.status === AttendanceStatus.PRESENT) {
      presentClasses++;
    } else if (rec.status === AttendanceStatus.ABSENT) {
      absentClasses++;
    } else if (rec.status === AttendanceStatus.LATE) {
      lateClasses++;
    }
  });

  // Count PRESENT and LATE as attended
  const attendedClasses = presentClasses + lateClasses;

  let attendancePercentage = 100;
  let isShortage = false;
  let classesNeededFor75 = 0;
  let classesCanMissToStayAbove75 = 0;

  if (totalClasses > 0) {
    attendancePercentage = Number(
      ((attendedClasses / totalClasses) * 100).toFixed(2),
    );
    isShortage = attendancePercentage < 75.0;

    if (isShortage) {
      // (attended + x) / (total + x) >= 0.75 => x >= 3 * total - 4 * attended
      classesNeededFor75 = Math.max(
        0,
        Math.ceil(3 * totalClasses - 4 * attendedClasses),
      );
      classesCanMissToStayAbove75 = 0;
    } else {
      classesNeededFor75 = 0;
      // (attended) / (total + y) >= 0.75 => y <= (4 * attended - 3 * total) / 3
      classesCanMissToStayAbove75 = Math.max(
        0,
        Math.floor((4 * attendedClasses - 3 * totalClasses) / 3),
      );
    }
  }

  return {
    subjectId: subject.id,
    subjectCode: subject.code,
    subjectName: subject.name,
    credits: subject.credits,
    totalClasses,
    presentClasses,
    absentClasses,
    lateClasses,
    attendancePercentage,
    isShortage,
    classesNeededFor75,
    classesCanMissToStayAbove75,
  };
};

export const calculateOverallAttendance = (
  data: RawAttendanceData,
): OverallAttendanceSummary => {
  const { records, enrolledSubjects } = data;

  const subjectMap = new Map<string, AttendanceRecord[]>();
  enrolledSubjects.forEach((sub) => {
    subjectMap.set(sub.id, []);
  });

  records.forEach((rec) => {
    const subId = rec.session.subjectId;
    if (!subjectMap.has(subId)) {
      subjectMap.set(subId, []);
    }
    subjectMap.get(subId)!.push(rec);
  });

  let totalClassesAll = 0;
  let presentClassesAll = 0;
  let absentClassesAll = 0;
  let lateClassesAll = 0;

  const subjectsSummary: SubjectAttendanceSummary[] = enrolledSubjects.map(
    (sub) => {
      const subRecords = subjectMap.get(sub.id) || [];
      const summary = calculateSubjectAttendance(sub, subRecords);

      totalClassesAll += summary.totalClasses;
      presentClassesAll += summary.presentClasses;
      absentClassesAll += summary.absentClasses;
      lateClassesAll += summary.lateClasses;

      return summary;
    },
  );

  const totalAttendedAll = presentClassesAll + lateClassesAll;
  const overallPercentage =
    totalClassesAll > 0
      ? Number(((totalAttendedAll / totalClassesAll) * 100).toFixed(2))
      : 100;
  const isShortage = overallPercentage < 75.0;

  return {
    totalClasses: totalClassesAll,
    presentClasses: presentClassesAll,
    absentClasses: absentClassesAll,
    lateClasses: lateClassesAll,
    overallPercentage,
    isShortage,
    subjectsSummary,
  };
};
