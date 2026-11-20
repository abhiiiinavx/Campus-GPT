import { PrismaClient } from "@prisma/client";
import {
  UserRole,
  StudentStatus,
  FacultyStatus,
  AttendanceStatus,
  DayOfWeek,
  NoticeCategory,
  NoticePriority,
  DocumentCategory,
  ProcessingStatus,
} from "../src/types/enums.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const generateDeterministicEmbedding = (
  text: string,
  dimensions = 768,
): number[] => {
  const vector = new Array(dimensions).fill(0);
  const words = text.toLowerCase().split(/\W+/).filter(Boolean);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = (hash << 5) - hash + word.charCodeAt(j);
      hash |= 0;
    }
    const index = Math.abs(hash) % dimensions;
    vector[index] += 1.0;
  }

  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] /= norm;
    }
  }
  return vector;
};

async function main() {
  console.log("🌱 Starting CampusIQ Database Seed for ABES Engineering College...");

  // 1. Clean existing records in correct relation order
  await prisma.documentChunk.deleteMany();
  await prisma.document.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.timetableEntry.deleteMany();
  await prisma.teachingAssignment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.student.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.user.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.department.deleteMany();

  console.log("🧹 Cleaned existing tables.");

  // 2. Departments
  const cseDept = await prisma.department.create({
    data: {
      code: "CSE",
      name: "Computer Science & Engineering",
      description: "Department of Computer Science & Engineering - ABES Engineering College",
    },
  });

  const itDept = await prisma.department.create({
    data: {
      code: "IT",
      name: "Information Technology",
      description: "Department of Information Technology - ABES Engineering College",
    },
  });

  const eceDept = await prisma.department.create({
    data: {
      code: "ECE",
      name: "Electronics & Communication Engineering",
      description: "Department of Electronics & Communication - ABES Engineering College",
    },
  });

  // 3. Semesters
  const sem4 = await prisma.semester.create({
    data: {
      number: 4,
      academicYear: "2025-2026",
      startDate: new Date("2026-01-10"),
      endDate: new Date("2026-06-20"),
      isCurrent: true,
    },
  });

  const sem6 = await prisma.semester.create({
    data: {
      number: 6,
      academicYear: "2025-2026",
      startDate: new Date("2026-01-10"),
      endDate: new Date("2026-06-20"),
      isCurrent: false,
    },
  });

  // 4. Passwords
  const commonPassword = await bcrypt.hash("Password@123", 10);
  const adminPassword = await bcrypt.hash("Admin@123", 10);

  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      fullName: "Dr. Eleanor Vance (Dean)",
      email: "admin@campusiq.edu",
      passwordHash: commonPassword,
      role: UserRole.ADMIN,
      phone: "+91-9876543210",
      gender: "Female",
    },
  });

  // Faculty Users
  const faculty1User = await prisma.user.create({
    data: {
      fullName: "Prof. Robert Smith",
      email: "faculty.cs@campusiq.edu",
      passwordHash: commonPassword,
      role: UserRole.FACULTY,
      phone: "+91-9876543211",
      gender: "Male",
    },
  });

  const faculty2User = await prisma.user.create({
    data: {
      fullName: "Dr. Sarah Connor (HOD CSE)",
      email: "dr.sarah@campusiq.edu",
      passwordHash: commonPassword,
      role: UserRole.FACULTY,
      phone: "+91-9876543212",
      gender: "Female",
    },
  });

  const faculty3User = await prisma.user.create({
    data: {
      fullName: "Prof. Alan Turing",
      email: "prof.alan@campusiq.edu",
      passwordHash: commonPassword,
      role: UserRole.FACULTY,
      phone: "+91-9876543213",
      gender: "Male",
    },
  });

  // Faculty Profiles
  const faculty1 = await prisma.faculty.create({
    data: {
      userId: faculty1User.id,
      departmentId: cseDept.id,
      employeeId: "FAC-ABES-CSE-101",
      designation: "Associate Professor",
      status: FacultyStatus.ACTIVE,
    },
  });

  const faculty2 = await prisma.faculty.create({
    data: {
      userId: faculty2User.id,
      departmentId: cseDept.id,
      employeeId: "FAC-ABES-CSE-102",
      designation: "Professor & Head of Department",
      status: FacultyStatus.ACTIVE,
    },
  });

  const faculty3 = await prisma.faculty.create({
    data: {
      userId: faculty3User.id,
      departmentId: cseDept.id,
      employeeId: "FAC-ABES-CSE-103",
      designation: "Assistant Professor",
      status: FacultyStatus.ACTIVE,
    },
  });

  // -------------------------------------------------------------
  // Primary Student: ABHINAV (ABES Engineering College, CSE 12)
  // -------------------------------------------------------------
  const abhinavUser = await prisma.user.create({
    data: {
      fullName: "Abhinav",
      email: "abhinav@campusiq.edu",
      passwordHash: commonPassword,
      role: UserRole.STUDENT,
      phone: "+91-9876543214",
      gender: "Male",
    },
  });

  // Alias student user so student.cs@campusiq.edu also works
  const studentDemoUser = await prisma.user.create({
    data: {
      fullName: "Abhinav (Student Demo)",
      email: "student.cs@campusiq.edu",
      passwordHash: commonPassword,
      role: UserRole.STUDENT,
      phone: "+91-9876543215",
      gender: "Male",
    },
  });

  const studentAbesEmailUser = await prisma.user.create({
    data: {
      fullName: "Abhinav",
      email: "abhinav@abes.ac.in",
      passwordHash: commonPassword,
      role: UserRole.STUDENT,
      phone: "+91-9876543214",
      gender: "Male",
    },
  });

  // Student Profiles
  const abhinavStudent = await prisma.student.create({
    data: {
      userId: abhinavUser.id,
      departmentId: cseDept.id,
      semesterId: sem4.id,
      rollNumber: "2400320100041",
      admissionYear: 2024,
      currentCGPA: 8.85,
      status: StudentStatus.ACTIVE,
    },
  });

  const demoStudent = await prisma.student.create({
    data: {
      userId: studentDemoUser.id,
      departmentId: cseDept.id,
      semesterId: sem4.id,
      rollNumber: "2400320100041-DEMO",
      admissionYear: 2024,
      currentCGPA: 8.85,
      status: StudentStatus.ACTIVE,
    },
  });

  const abesStudent = await prisma.student.create({
    data: {
      userId: studentAbesEmailUser.id,
      departmentId: cseDept.id,
      semesterId: sem4.id,
      rollNumber: "2400320100041-ABES",
      admissionYear: 2024,
      currentCGPA: 8.85,
      status: StudentStatus.ACTIVE,
    },
  });

  // 5. Subjects (ABES CSE Section 12)
  const dbms = await prisma.subject.create({
    data: {
      code: "BCS401",
      name: "Database Management Systems",
      description: "Relational algebra, SQL queries, Normalization (1NF-BCNF), Indexing & Transactions (ACID).",
      credits: 4,
      departmentId: cseDept.id,
      semesterId: sem4.id,
    },
  });

  const os = await prisma.subject.create({
    data: {
      code: "BCS402",
      name: "Operating Systems",
      description: "Process synchronization, Deadlocks, Memory paging, Virtual Memory & Linux file system.",
      credits: 4,
      departmentId: cseDept.id,
      semesterId: sem4.id,
    },
  });

  const daa = await prisma.subject.create({
    data: {
      code: "BCS403",
      name: "Design & Analysis of Algorithms",
      description: "Divide and Conquer, Greedy algorithms, Dynamic Programming, Graph traversals & NP-completeness.",
      credits: 4,
      departmentId: cseDept.id,
      semesterId: sem4.id,
    },
  });

  const cn = await prisma.subject.create({
    data: {
      code: "BCS404",
      name: "Computer Networks",
      description: "OSI vs TCP/IP stack, IP subnetting, Routing algorithms, TCP flow control & Socket programming.",
      credits: 3,
      departmentId: cseDept.id,
      semesterId: sem4.id,
    },
  });

  const aiml = await prisma.subject.create({
    data: {
      code: "BCS405",
      name: "Artificial Intelligence & Machine Learning",
      description: "Heuristic search, Supervised learning, Neural networks, NLP and LLM Prompt Architecture.",
      credits: 3,
      departmentId: cseDept.id,
      semesterId: sem4.id,
    },
  });

  // 6. Teaching Assignments
  await prisma.teachingAssignment.createMany({
    data: [
      { facultyId: faculty1.id, subjectId: dbms.id },
      { facultyId: faculty1.id, subjectId: os.id },
      { facultyId: faculty3.id, subjectId: daa.id },
      { facultyId: faculty3.id, subjectId: cn.id },
      { facultyId: faculty2.id, subjectId: aiml.id },
    ],
  });

  // 7. Enrollments
  const allSubjects = [dbms, os, daa, cn, aiml];
  const allTargetStudents = [abhinavStudent, demoStudent, abesStudent];

  for (const stu of allTargetStudents) {
    for (const sub of allSubjects) {
      await prisma.enrollment.create({
        data: { studentId: stu.id, subjectId: sub.id },
      });
    }
  }

  // 8. Timetable Entries (ABES Section CSE-12)
  const timetableSlots = [
    // Monday
    {
      subjectId: dbms.id,
      facultyId: faculty1.id,
      departmentId: cseDept.id,
      semesterId: sem4.id,
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: "09:00",
      endTime: "10:00",
      room: "R-312 (CSE-12)",
    },
    {
      subjectId: os.id,
      facultyId: faculty1.id,
      departmentId: cseDept.id,
      semesterId: sem4.id,
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: "10:00",
      endTime: "11:00",
      room: "R-312 (CSE-12)",
    },
    {
      subjectId: daa.id,
      facultyId: faculty3.id,
      departmentId: cseDept.id,
      semesterId: sem4.id,
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: "11:30",
      endTime: "12:30",
      room: "R-312 (CSE-12)",
    },
    {
      subjectId: aiml.id,
      facultyId: faculty2.id,
      departmentId: cseDept.id,
      semesterId: sem4.id,
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: "14:00",
      endTime: "16:00",
      room: "AI Lab-4 (ABES Block B)",
    },
    // Tuesday
    {
      subjectId: cn.id,
      facultyId: faculty3.id,
      departmentId: cseDept.id,
      semesterId: sem4.id,
      dayOfWeek: DayOfWeek.TUESDAY,
      startTime: "09:00",
      endTime: "10:00",
      room: "R-312 (CSE-12)",
    },
    {
      subjectId: dbms.id,
      facultyId: faculty1.id,
      departmentId: cseDept.id,
      semesterId: sem4.id,
      dayOfWeek: DayOfWeek.TUESDAY,
      startTime: "10:00",
      endTime: "11:00",
      room: "R-312 (CSE-12)",
    },
    {
      subjectId: daa.id,
      facultyId: faculty3.id,
      departmentId: cseDept.id,
      semesterId: sem4.id,
      dayOfWeek: DayOfWeek.TUESDAY,
      startTime: "11:30",
      endTime: "13:00",
      room: "Algo Lab-2",
    },
    // Wednesday
    {
      subjectId: os.id,
      facultyId: faculty1.id,
      departmentId: cseDept.id,
      semesterId: sem4.id,
      dayOfWeek: DayOfWeek.WEDNESDAY,
      startTime: "09:00",
      endTime: "10:00",
      room: "R-312 (CSE-12)",
    },
    {
      subjectId: aiml.id,
      facultyId: faculty2.id,
      departmentId: cseDept.id,
      semesterId: sem4.id,
      dayOfWeek: DayOfWeek.WEDNESDAY,
      startTime: "10:00",
      endTime: "11:00",
      room: "R-312 (CSE-12)",
    },
    {
      subjectId: cn.id,
      facultyId: faculty3.id,
      departmentId: cseDept.id,
      semesterId: sem4.id,
      dayOfWeek: DayOfWeek.WEDNESDAY,
      startTime: "11:30",
      endTime: "12:30",
      room: "R-312 (CSE-12)",
    },
    // Thursday
    {
      subjectId: dbms.id,
      facultyId: faculty1.id,
      departmentId: cseDept.id,
      semesterId: sem4.id,
      dayOfWeek: DayOfWeek.THURSDAY,
      startTime: "09:00",
      endTime: "11:00",
      room: "DBMS Lab-1",
    },
    {
      subjectId: daa.id,
      facultyId: faculty3.id,
      departmentId: cseDept.id,
      semesterId: sem4.id,
      dayOfWeek: DayOfWeek.THURSDAY,
      startTime: "11:30",
      endTime: "12:30",
      room: "R-312 (CSE-12)",
    },
    // Friday
    {
      subjectId: os.id,
      facultyId: faculty1.id,
      departmentId: cseDept.id,
      semesterId: sem4.id,
      dayOfWeek: DayOfWeek.FRIDAY,
      startTime: "09:00",
      endTime: "10:00",
      room: "R-312 (CSE-12)",
    },
    {
      subjectId: aiml.id,
      facultyId: faculty2.id,
      departmentId: cseDept.id,
      semesterId: sem4.id,
      dayOfWeek: DayOfWeek.FRIDAY,
      startTime: "10:00",
      endTime: "11:00",
      room: "R-312 (CSE-12)",
    },
  ];

  for (const slot of timetableSlots) {
    await prisma.timetableEntry.create({ data: slot });
  }

  // 9. Attendance Sessions & Records for Abhinav (Realistic 75% analysis data)
  // In DBMS: 9 attended out of 13 = 69.23% (Shortage!) -> Needs 3 consecutive classes to hit >= 75%
  const dbmsAttendance = [
    { date: "2026-02-02", status: AttendanceStatus.PRESENT },
    { date: "2026-02-05", status: AttendanceStatus.PRESENT },
    { date: "2026-02-09", status: AttendanceStatus.ABSENT },
    { date: "2026-02-12", status: AttendanceStatus.PRESENT },
    { date: "2026-02-16", status: AttendanceStatus.ABSENT },
    { date: "2026-02-19", status: AttendanceStatus.PRESENT },
    { date: "2026-02-23", status: AttendanceStatus.LATE },
    { date: "2026-02-26", status: AttendanceStatus.ABSENT },
    { date: "2026-03-02", status: AttendanceStatus.PRESENT },
    { date: "2026-03-05", status: AttendanceStatus.PRESENT },
    { date: "2026-03-09", status: AttendanceStatus.ABSENT },
    { date: "2026-03-12", status: AttendanceStatus.PRESENT },
    { date: "2026-03-16", status: AttendanceStatus.PRESENT },
  ];

  for (let i = 0; i < dbmsAttendance.length; i++) {
    const item = dbmsAttendance[i];
    const sess = await prisma.attendanceSession.create({
      data: {
        subjectId: dbms.id,
        facultyId: faculty1.id,
        date: new Date(item.date),
        startTime: "09:00",
        endTime: "10:00",
        topic: `DBMS Unit Lecture ${i + 1}`,
      },
    });

    for (const stu of allTargetStudents) {
      await prisma.attendanceRecord.create({
        data: {
          sessionId: sess.id,
          studentId: stu.id,
          status: item.status,
        },
      });
    }
  }

  // OS Attendance: 12 attended out of 13 = 92.3%
  for (let i = 1; i <= 13; i++) {
    const sess = await prisma.attendanceSession.create({
      data: {
        subjectId: os.id,
        facultyId: faculty1.id,
        date: new Date(`2026-02-${String(((i * 2) % 28) + 1).padStart(2, "0")}`),
        startTime: "10:00",
        endTime: "11:00",
        topic: `OS Lecture #${i}`,
      },
    });

    for (const stu of allTargetStudents) {
      await prisma.attendanceRecord.create({
        data: {
          sessionId: sess.id,
          studentId: stu.id,
          status: i === 4 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT,
        },
      });
    }
  }

  // DAA, CN, AIML Attendance sessions
  for (let i = 1; i <= 12; i++) {
    const sessDAA = await prisma.attendanceSession.create({
      data: {
        subjectId: daa.id,
        facultyId: faculty3.id,
        date: new Date(`2026-02-${String(((i * 2) % 28) + 1).padStart(2, "0")}`),
        startTime: "11:30",
        endTime: "12:30",
        topic: `DAA Lecture ${i}`,
      },
    });

    for (const stu of allTargetStudents) {
      await prisma.attendanceRecord.create({
        data: {
          sessionId: sessDAA.id,
          studentId: stu.id,
          status: i > 10 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT,
        },
      });
    }

    const sessCN = await prisma.attendanceSession.create({
      data: {
        subjectId: cn.id,
        facultyId: faculty3.id,
        date: new Date(`2026-02-${String(((i * 2) % 28) + 1).padStart(2, "0")}`),
        startTime: "09:00",
        endTime: "10:00",
        topic: `CN Module ${i}`,
      },
    });

    for (const stu of allTargetStudents) {
      await prisma.attendanceRecord.create({
        data: {
          sessionId: sessCN.id,
          studentId: stu.id,
          status: AttendanceStatus.PRESENT,
        },
      });
    }

    const sessAIML = await prisma.attendanceSession.create({
      data: {
        subjectId: aiml.id,
        facultyId: faculty2.id,
        date: new Date(`2026-02-${String(((i * 2) % 28) + 1).padStart(2, "0")}`),
        startTime: "14:00",
        endTime: "15:30",
        topic: `AIML Deep Dive ${i}`,
      },
    });

    for (const stu of allTargetStudents) {
      await prisma.attendanceRecord.create({
        data: {
          sessionId: sessAIML.id,
          studentId: stu.id,
          status: i % 4 === 0 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT,
        },
      });
    }
  }

  // 10. Notices (ABES Engineering College)
  await prisma.notice.createMany({
    data: [
      {
        title: "ABES EC: End-Semester Exam Schedule & 75% Attendance Requirement",
        content:
          "All B.Tech CSE students of ABES Engineering College are hereby informed that End-Semester Theory Examinations commence on May 10, 2026. As per AKTU and ABES regulations, a strict minimum 75% attendance is compulsory to receive admit cards.",
        category: NoticeCategory.EXAM,
        priority: NoticePriority.URGENT,
        publishedAt: new Date("2026-03-01"),
        createdBy: adminUser.id,
      },
      {
        title: "ABES CSE-12: Smart India Hackathon & Generative AI Workshop",
        content:
          "Special hands-on workshop on LLMs and Full-Stack System Architecture for Section CSE-12 in Auditorium 2 on Friday at 2:00 PM.",
        category: NoticeCategory.ACADEMIC,
        priority: NoticePriority.HIGH,
        publishedAt: new Date("2026-03-15"),
        createdBy: faculty2User.id,
      },
      {
        title: "ABES Engineering College: Annual Technical Fest 'Genera 2026'",
        content:
          "Registrations are officially open for Genera 2026 featuring coding marathons, web3 challenges, and drone racing. Register via the CampusIQ portal.",
        category: NoticeCategory.EVENT,
        priority: NoticePriority.MEDIUM,
        publishedAt: new Date("2026-03-10"),
        createdBy: faculty1User.id,
      },
      {
        title: "Campus Placement: Tier-1 Tech Drive (Google, Atlassian, Microsoft)",
        content:
          "On-campus placement drives for B.Tech CSE students having CGPA >= 8.0 will be conducted starting April 5th. Prepare DSA and System Design topics.",
        category: NoticeCategory.PLACEMENT,
        priority: NoticePriority.HIGH,
        publishedAt: new Date("2026-03-12"),
        createdBy: adminUser.id,
      },
    ],
  });

  // 11. Documents & Chunks (RAG Knowledge Base)
  const doc1 = await prisma.document.create({
    data: {
      title: "ABES Engineering College Academic Ordinance & 75% Attendance Rule",
      description: "Official ABES regulations regarding mandatory 75% attendance, medical condonation up to 10%, detention criteria, and examination policies.",
      category: DocumentCategory.ACADEMIC,
      fileName: "ABES_Academic_Regulations_2026.pdf",
      fileUrl: "uploads/documents/ABES_Academic_Regulations_2026.pdf",
      mimeType: "application/pdf",
      fileSize: 245000,
      uploadedBy: adminUser.id,
      processingStatus: ProcessingStatus.COMPLETED,
    },
  });

  const doc1Chunks = [
    {
      content:
        "ABES ENGINEERING COLLEGE - SECTION 4: ATTENDANCE MANDATE. Every student enrolled in B.Tech CSE (including Section CSE-12) must maintain at least 75% attendance in each individual course. Students falling below 75% face academic shortage and must attend makeup classes to be eligible for end-term examinations.",
      pageNumber: 1,
      chunkIndex: 0,
    },
    {
      content:
        "ABES EC - SECTION 4.2: CONDONATION RULES. The Head of Department (HOD) and Dean may recommend attendance condonation up to 10% (between 65% and 74.9%) purely on certified medical emergencies or official university representation.",
      pageNumber: 2,
      chunkIndex: 1,
    },
    {
      content:
        "ABES EC - SECTION 5: GRADING SYSTEM & CREDITS. B.Tech Computer Science courses follow a 10-point CGPA grading scale. Semester Grade Point Average (SGPA) and Cumulative Grade Point Average (CGPA) require minimum 40% passing marks in both continuous evaluation and semester-end exams.",
      pageNumber: 3,
      chunkIndex: 2,
    },
  ];

  for (const chunk of doc1Chunks) {
    const embedding = generateDeterministicEmbedding(chunk.content);
    await prisma.documentChunk.create({
      data: {
        documentId: doc1.id,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        pageNumber: chunk.pageNumber,
        embedding: JSON.stringify(embedding),
      },
    });
  }

  const doc2 = await prisma.document.create({
    data: {
      title: "ABES Placement Guidelines & Industry Training Policy",
      description: "Placement eligibility criteria, interview procedures, and minimum CGPA criteria for tier-1 companies.",
      category: DocumentCategory.PLACEMENT,
      fileName: "ABES_Placement_Policy_2026.pdf",
      fileUrl: "uploads/documents/ABES_Placement_Policy_2026.pdf",
      mimeType: "application/pdf",
      fileSize: 185000,
      uploadedBy: adminUser.id,
      processingStatus: ProcessingStatus.COMPLETED,
    },
  });

  const doc2Chunks = [
    {
      content:
        "ABES PLACEMENT CELL: ELIGIBILITY CRITERIA. Students with CGPA >= 7.5 and no active backlogs are eligible for Day-1 companies. For Super-Dream offers (CTCs > 15 LPA) from companies like Google, Microsoft, and Amazon, a minimum CGPA of 8.0 is required.",
      pageNumber: 1,
      chunkIndex: 0,
    },
  ];

  for (const chunk of doc2Chunks) {
    const embedding = generateDeterministicEmbedding(chunk.content);
    await prisma.documentChunk.create({
      data: {
        documentId: doc2.id,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        pageNumber: chunk.pageNumber,
        embedding: JSON.stringify(embedding),
      },
    });
  }

  console.log("✅ Seed completed successfully!");
  console.log("------------------------------------------------------------------");
  console.log("🎓 Student Profile: Abhinav");
  console.log("🏛️ College: ABES Engineering College");
  console.log("💻 Branch: Computer Science & Engineering (CSE)");
  console.log("🏫 Section: CSE 12");
  console.log("🔢 Roll Number: 2400320100041");
  console.log("📧 Login Emails:");
  console.log("   - abhinav@campusiq.edu   (Password: Password@123)");
  console.log("   - student.cs@campusiq.edu (Password: Password@123)");
  console.log("   - abhinav@abes.ac.in     (Password: Password@123)");
  console.log("👨‍🏫 Faculty: faculty.cs@campusiq.edu (Password: Password@123)");
  console.log("🛡️ Admin: admin@campusiq.edu (Password: Password@123)");
  console.log("------------------------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
