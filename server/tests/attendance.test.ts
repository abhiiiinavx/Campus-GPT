import { describe, it, expect } from "vitest";
import { calculateSubjectAttendance } from "../src/utils/attendanceCalculator.js";
import { AttendanceRecord, Subject } from "@prisma/client";
import { AttendanceStatus } from "../src/types/enums.js";

describe("Attendance Calculator Engine", () => {
  const dummySubject: Subject = {
    id: "sub-1",
    code: "CS401",
    name: "Database Management Systems",
    description: null,
    credits: 4,
    departmentId: "dept-1",
    semesterId: "sem-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("calculates 100% attendance for empty or fully attended records", () => {
    const records: AttendanceRecord[] = [
      {
        id: "1",
        sessionId: "s1",
        studentId: "st1",
        status: AttendanceStatus.PRESENT,
        remarks: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = calculateSubjectAttendance(dummySubject, records);
    expect(result.attendancePercentage).toBe(100);
    expect(result.isShortage).toBe(false);
    expect(result.classesNeededFor75).toBe(0);
    expect(result.classesCanMissToStayAbove75).toBe(0);
  });

  it("correctly flags shortage below 75% and computes exact classes needed to reach 75%", () => {
    // 6 present out of 10 = 60%
    // To reach 75%: (6 + x)/(10 + x) >= 0.75 => x >= 3(10) - 4(6) = 30 - 24 = 6 classes
    const records: AttendanceRecord[] = [];
    for (let i = 0; i < 6; i++) {
      records.push({
        id: `p-${i}`,
        sessionId: `s-${i}`,
        studentId: "st1",
        status: AttendanceStatus.PRESENT,
        remarks: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    for (let i = 0; i < 4; i++) {
      records.push({
        id: `a-${i}`,
        sessionId: `sa-${i}`,
        studentId: "st1",
        status: AttendanceStatus.ABSENT,
        remarks: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const result = calculateSubjectAttendance(dummySubject, records);
    expect(result.totalClasses).toBe(10);
    expect(result.presentClasses).toBe(6);
    expect(result.absentClasses).toBe(4);
    expect(result.attendancePercentage).toBe(60);
    expect(result.isShortage).toBe(true);
    expect(result.classesNeededFor75).toBe(6);
  });

  it("correctly calculates how many classes a student can safely miss if above 75%", () => {
    // 9 present out of 10 = 90%
    // (9) / (10 + y) >= 0.75 => y <= (4*9 - 3*10)/3 = (36 - 30)/3 = 2 classes
    const records: AttendanceRecord[] = [];
    for (let i = 0; i < 9; i++) {
      records.push({
        id: `p-${i}`,
        sessionId: `s-${i}`,
        studentId: "st1",
        status: AttendanceStatus.PRESENT,
        remarks: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    records.push({
      id: `a-1`,
      sessionId: `sa-1`,
      studentId: "st1",
      status: AttendanceStatus.ABSENT,
      remarks: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = calculateSubjectAttendance(dummySubject, records);
    expect(result.attendancePercentage).toBe(90);
    expect(result.isShortage).toBe(false);
    expect(result.classesCanMissToStayAbove75).toBe(2);
  });
});
