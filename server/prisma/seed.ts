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
  console.log("🌱 Starting CampusIQ Database Seed for ABES Engineering College (CSE-12)...");

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
      name: "Computer Science & Engineering (Cluster-2)",
      description: "Department of Computer Science & Engineering (Cluster-2) - ABES Engineering College, Ghaziabad",
    },
  });

  const itDept = await prisma.department.create({
    data: {
      code: "IT",
      name: "Information Technology",
      description: "Department of Information Technology - ABES Engineering College, Ghaziabad",
    },
  });

  // 3. Semesters (5th Semester, 2026-27 ODD Semester w.e.f. 27.07.2026)
  const sem5 = await prisma.semester.create({
    data: {
      number: 5,
      academicYear: "2026-2027",
      startDate: new Date("2026-07-27"),
      endDate: new Date("2026-12-24"),
      isCurrent: true,
    },
  });

  const sem6 = await prisma.semester.create({
    data: {
      number: 6,
      academicYear: "2026-2027",
      startDate: new Date("2027-01-10"),
      endDate: new Date("2027-06-20"),
      isCurrent: false,
    },
  });

  // 4. Passwords
  const commonPassword = await bcrypt.hash("Password@123", 10);
  const adminPassword = await bcrypt.hash("Admin@123", 10);

  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      fullName: "Academic Dean (ABES EC)",
      email: "admin@campusiq.edu",
      passwordHash: commonPassword,
      role: UserRole.ADMIN,
      phone: "+91-9876543210",
      gender: "Male",
    },
  });

  // 5. Faculty Directory (Exact ABES EC Timetable Faculty)
  // - TS: Ms. Tanvishree (DBMS & DBMS Lab)
  // - VK: Mr. Vikki (Web Tech, Applied AI, Web Tech Lab)
  // - RJ: Ms. Ruchi Jain (DAA & DAA Lab)
  // - Komal: Ms. Komal (OOSD with C++)
  // - VAS: Ms. Varsha Saxena (Machine Learning Techniques)
  // - Rishabh: Mr. Rishabh (Web Tech Lab G2)
  // - PT: Mr. Prashant Tomar (FSD Training)
  // - MB: Ms. Megha Bajaj (Soft Skills)
  // - Shiv: Mr. Shiv (QA/LR)
  // - Domain Training Faculty: Mr. Aditya Tandon / Dr. Shruti Gupta
  // - DSA: Faculty (DSA - XXX)

  const tsUser = await prisma.user.create({
    data: {
      fullName: "Ms. Tanvishree (TS)",
      email: "tanvishree@campusiq.edu",
      passwordHash: commonPassword,
      role: UserRole.FACULTY,
      phone: "+91-9876543220",
      gender: "Female",
    },
  });

  const vkUser = await prisma.user.create({
    data: {
      fullName: "Mr. Vikki (VK)",
      email: "vikki@campusiq.edu",
      passwordHash: commonPassword,
      role: UserRole.FACULTY,
      phone: "+91-9876543221",
      gender: "Male",
    },
  });

  const rjUser = await prisma.user.create({
    data: {
      fullName: "Ms. Ruchi Jain (RJ)",
      email: "ruchijain@campusiq.edu",
      passwordHash: commonPassword,
      role: UserRole.FACULTY,
      phone: "+91-9876543222",
      gender: "Female",
    },
  });

  const komalUser = await prisma.user.create({
    data: {
      fullName: "Ms. Komal",
      email: "komal@campusiq.edu",
      passwordHash: commonPassword,
      role: UserRole.FACULTY,
      phone: "+91-9876543223",
      gender: "Female",
    },
  });

  const vasUser = await prisma.user.create({
    data: {
      fullName: "Ms. Varsha Saxena (VAS)",
      email: "varshasaxena@campusiq.edu",
      passwordHash: commonPassword,
      role: UserRole.FACULTY,
      phone: "+91-9876543224",
      gender: "Female",
    },
  });

  const rishabhUser = await prisma.user.create({
    data: {
      fullName: "Mr. Rishabh",
      email: "rishabh@campusiq.edu",
      passwordHash: commonPassword,
      role: UserRole.FACULTY,
      phone: "+91-9876543225",
      gender: "Male",
    },
  });

  const ptUser = await prisma.user.create({
    data: {
      fullName: "Mr. Prashant Tomar (PT)",
      email: "prashanttomar@campusiq.edu",
      passwordHash: commonPassword,
      role: UserRole.FACULTY,
      phone: "+91-9876543226",
      gender: "Male",
    },
  });

  const mbUser = await prisma.user.create({
    data: {
      fullName: "Ms. Megha Bajaj (MB)",
      email: "meghabajaj@campusiq.edu",
      passwordHash: commonPassword,
      role: UserRole.FACULTY,
      phone: "+91-9876543227",
      gender: "Female",
    },
  });

  const shivUser = await prisma.user.create({
    data: {
      fullName: "Mr. Shiv",
      email: "shiv@campusiq.edu",
      passwordHash: commonPassword,
      role: UserRole.FACULTY,
      phone: "+91-9876543228",
      gender: "Male",
    },
  });

  const domainUser = await prisma.user.create({
    data: {
      fullName: "Domain Training Faculty (Mr. Aditya Tandon / Dr. Shruti Gupta)",
      email: "domain@campusiq.edu",
      passwordHash: commonPassword,
      role: UserRole.FACULTY,
      phone: "+91-9876543229",
      gender: "Male",
    },
  });

  const dsaUser = await prisma.user.create({
    data: {
      fullName: "Faculty (DSA - XXX)",
      email: "dsa.faculty@campusiq.edu",
      passwordHash: commonPassword,
      role: UserRole.FACULTY,
      phone: "+91-9876543230",
      gender: "Male",
    },
  });

  // Standard demo faculty login alias
  const facultyDemoUser = await prisma.user.create({
    data: {
      fullName: "Ms. Tanvishree (TS)",
      email: "faculty.cs@campusiq.edu",
      passwordHash: commonPassword,
      role: UserRole.FACULTY,
      phone: "+91-9876543211",
      gender: "Female",
    },
  });

  // Faculty Profiles
  const facTS = await prisma.faculty.create({
    data: {
      userId: tsUser.id,
      departmentId: cseDept.id,
      employeeId: "FAC-ABES-TS-01",
      designation: "Assistant Professor",
      status: FacultyStatus.ACTIVE,
    },
  });

  const facVK = await prisma.faculty.create({
    data: {
      userId: vkUser.id,
      departmentId: cseDept.id,
      employeeId: "FAC-ABES-VK-02",
      designation: "Assistant Professor",
      status: FacultyStatus.ACTIVE,
    },
  });

  const facRJ = await prisma.faculty.create({
    data: {
      userId: rjUser.id,
      departmentId: cseDept.id,
      employeeId: "FAC-ABES-RJ-03",
      designation: "Associate Professor",
      status: FacultyStatus.ACTIVE,
    },
  });

  const facKomal = await prisma.faculty.create({
    data: {
      userId: komalUser.id,
      departmentId: cseDept.id,
      employeeId: "FAC-ABES-KM-04",
      designation: "Assistant Professor",
      status: FacultyStatus.ACTIVE,
    },
  });

  const facVAS = await prisma.faculty.create({
    data: {
      userId: vasUser.id,
      departmentId: cseDept.id,
      employeeId: "FAC-ABES-VAS-05",
      designation: "Associate Professor",
      status: FacultyStatus.ACTIVE,
    },
  });

  const facRishabh = await prisma.faculty.create({
    data: {
      userId: rishabhUser.id,
      departmentId: cseDept.id,
      employeeId: "FAC-ABES-RS-06",
      designation: "Assistant Professor",
      status: FacultyStatus.ACTIVE,
    },
  });

  const facPT = await prisma.faculty.create({
    data: {
      userId: ptUser.id,
      departmentId: cseDept.id,
      employeeId: "FAC-ABES-PT-07",
      designation: "Trainer - Full Stack Development",
      status: FacultyStatus.ACTIVE,
    },
  });

  const facMB = await prisma.faculty.create({
    data: {
      userId: mbUser.id,
      departmentId: cseDept.id,
      employeeId: "FAC-ABES-MB-08",
      designation: "Trainer - Soft Skills",
      status: FacultyStatus.ACTIVE,
    },
  });

  const facShiv = await prisma.faculty.create({
    data: {
      userId: shivUser.id,
      departmentId: cseDept.id,
      employeeId: "FAC-ABES-SH-09",
      designation: "Trainer - QA / Logical Reasoning",
      status: FacultyStatus.ACTIVE,
    },
  });

  const facDomain = await prisma.faculty.create({
    data: {
      userId: domainUser.id,
      departmentId: cseDept.id,
      employeeId: "FAC-ABES-DT-10",
      designation: "Domain Specialization Lead",
      status: FacultyStatus.ACTIVE,
    },
  });

  const facDSA = await prisma.faculty.create({
    data: {
      userId: dsaUser.id,
      departmentId: cseDept.id,
      employeeId: "FAC-ABES-DSA-11",
      designation: "Assistant Professor",
      status: FacultyStatus.ACTIVE,
    },
  });

  await prisma.faculty.create({
    data: {
      userId: facultyDemoUser.id,
      departmentId: cseDept.id,
      employeeId: "FAC-ABES-DEMO-12",
      designation: "Assistant Professor",
      status: FacultyStatus.ACTIVE,
    },
  });

  // 6. Student Profiles: Abhinav (ABES EC, Section CSE-12, Semester 5)
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

  const abhinavStudent = await prisma.student.create({
    data: {
      userId: abhinavUser.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
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
      semesterId: sem5.id,
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
      semesterId: sem5.id,
      rollNumber: "2400320100041-ABES",
      admissionYear: 2024,
      currentCGPA: 8.85,
      status: StudentStatus.ACTIVE,
    },
  });

  // 7. Exact Subjects from ABES Engineering College Timetable (5th Semester)
  const bcs501 = await prisma.subject.create({
    data: {
      code: "BCS501",
      name: "Database Management System",
      description: "Relational database models, SQL queries, normalization, transactions, ACID properties & indexing. Taught by Ms. Tanvishree (TS).",
      credits: 4,
      departmentId: cseDept.id,
      semesterId: sem5.id,
    },
  });

  const bcs502 = await prisma.subject.create({
    data: {
      code: "BCS502",
      name: "Web Technology",
      description: "Frontend HTML/CSS/JavaScript, backend APIs, RESTful services, full-stack architecture & web security. Taught by Mr. Vikki (VK).",
      credits: 3,
      departmentId: cseDept.id,
      semesterId: sem5.id,
    },
  });

  const bcs503 = await prisma.subject.create({
    data: {
      code: "BCS503",
      name: "Design & Analysis of Algorithm",
      description: "Asymptotic analysis, divide & conquer, dynamic programming, greedy algorithms, graph algorithms & NP-completeness. Taught by Ms. Ruchi Jain (RJ).",
      credits: 4,
      departmentId: cseDept.id,
      semesterId: sem5.id,
    },
  });

  const bcs054 = await prisma.subject.create({
    data: {
      code: "BCS054",
      name: "Object Oriented System Design with C++",
      description: "Object-oriented design patterns, C++ templates, STL, memory management, inheritance, polymorphism & system modeling. Taught by Ms. Komal.",
      credits: 3,
      departmentId: cseDept.id,
      semesterId: sem5.id,
    },
  });

  const bcs055 = await prisma.subject.create({
    data: {
      code: "BCS055",
      name: "Machine Learning Techniques",
      description: "Supervised and unsupervised learning, gradient descent, regression, classification, SVMs, neural networks & clustering. Taught by Ms. Varsha Saxena (VAS).",
      credits: 3,
      departmentId: cseDept.id,
      semesterId: sem5.id,
    },
  });

  const bcs551 = await prisma.subject.create({
    data: {
      code: "BCS551",
      name: "Database Management System Lab",
      description: "Practical database design, complex SQL joins, triggers, procedures, views & transaction testing. Conducted in Lab 23 by Ms. Tanvishree (TS).",
      credits: 1,
      departmentId: cseDept.id,
      semesterId: sem5.id,
    },
  });

  const bcs552 = await prisma.subject.create({
    data: {
      code: "BCS552",
      name: "Web Technology Lab",
      description: "Hands-on web engineering, DOM manipulation, asynchronous JavaScript, Node/Express backend development. Conducted in Lab 20/Lab 23 by Mr. Vikki (VK) & Mr. Rishabh.",
      credits: 1,
      departmentId: cseDept.id,
      semesterId: sem5.id,
    },
  });

  const bcs553 = await prisma.subject.create({
    data: {
      code: "BCS553",
      name: "Design & Analysis of Algorithm Lab",
      description: "Algorithm implementations, time-complexity benchmarks, sorting, shortest paths & dynamic programming. Conducted in Lab 20 by Ms. Ruchi Jain (RJ).",
      credits: 1,
      departmentId: cseDept.id,
      semesterId: sem5.id,
    },
  });

  const appliedAi = await prisma.subject.create({
    data: {
      code: "APPLIED-AI",
      name: "Applied AI",
      description: "Practical artificial intelligence applications, deep learning toolkits, computer vision & generative AI models. Taught by Mr. Vikki (VK).",
      credits: 2,
      departmentId: cseDept.id,
      semesterId: sem5.id,
    },
  });

  const fsd = await prisma.subject.create({
    data: {
      code: "FSD",
      name: "Full Stack Development (FSD)",
      description: "Comprehensive industry full-stack development, modern web stacks, reactive user interfaces & production deployment. Taught by Mr. Prashant Tomar (PT).",
      credits: 2,
      departmentId: cseDept.id,
      semesterId: sem5.id,
    },
  });

  const dsa = await prisma.subject.create({
    data: {
      code: "DSA",
      name: "Data Structures & Algorithms (DSA)",
      description: "Core problem-solving, advanced trees, graphs, heaps, dynamic programming & placement-ready competitive coding. Taught by Faculty (XXX).",
      credits: 4,
      departmentId: cseDept.id,
      semesterId: sem5.id,
    },
  });

  const domainTrg = await prisma.subject.create({
    data: {
      code: "DOMAIN-TRG",
      name: "Domain Training",
      description: "Specialized domain training across Data Science / AI / ML, Cloud Computing, and Network & Cyber Security tracks.",
      credits: 2,
      departmentId: cseDept.id,
      semesterId: sem5.id,
    },
  });

  const softSkill = await prisma.subject.create({
    data: {
      code: "SOFT-SKILL",
      name: "Soft Skill",
      description: "Professional workplace communication, group discussions, corporate etiquette & interview preparation. Taught by Ms. Megha Bajaj (MB).",
      credits: 1,
      departmentId: cseDept.id,
      semesterId: sem5.id,
    },
  });

  const qaLr = await prisma.subject.create({
    data: {
      code: "QA-LR",
      name: "Quantitative Aptitude / Logical Reasoning",
      description: "Analytical problem solving, arithmetic reasoning, data interpretation & competitive test preparation. Taught by Mr. Shiv.",
      credits: 1,
      departmentId: cseDept.id,
      semesterId: sem5.id,
    },
  });

  // 8. Teaching Assignments (Faculty Directory)
  await prisma.teachingAssignment.createMany({
    data: [
      { facultyId: facTS.id, subjectId: bcs501.id },
      { facultyId: facTS.id, subjectId: bcs551.id },
      { facultyId: facVK.id, subjectId: bcs502.id },
      { facultyId: facVK.id, subjectId: bcs552.id },
      { facultyId: facVK.id, subjectId: appliedAi.id },
      { facultyId: facRJ.id, subjectId: bcs503.id },
      { facultyId: facRJ.id, subjectId: bcs553.id },
      { facultyId: facKomal.id, subjectId: bcs054.id },
      { facultyId: facVAS.id, subjectId: bcs055.id },
      { facultyId: facRishabh.id, subjectId: bcs552.id },
      { facultyId: facPT.id, subjectId: fsd.id },
      { facultyId: facMB.id, subjectId: softSkill.id },
      { facultyId: facShiv.id, subjectId: qaLr.id },
      { facultyId: facDomain.id, subjectId: domainTrg.id },
      { facultyId: facDSA.id, subjectId: dsa.id },
    ],
  });

  // 9. Enrollments for all Target Students
  const allSubjects = [
    bcs501,
    bcs502,
    bcs503,
    bcs054,
    bcs055,
    bcs551,
    bcs552,
    bcs553,
    appliedAi,
    fsd,
    dsa,
    domainTrg,
    softSkill,
    qaLr,
  ];

  const allTargetStudents = [abhinavStudent, demoStudent, abesStudent];

  for (const stu of allTargetStudents) {
    for (const sub of allSubjects) {
      await prisma.enrollment.create({
        data: { studentId: stu.id, subjectId: sub.id },
      });
    }
  }

  // 10. EXACT TIMETABLE ENTRIES (ABES Engineering College, Ghaziabad - CSE Section 12)
  // Classroom: KC-TF-305 (Main Lecture Hall)
  // Labs: Lab 20, Lab 23
  // Periods:
  // P1: 08:50-09:40 | P2: 09:40-10:30 | P3: 10:40-11:30 | P4: 11:30-12:20 | P5: 12:20-13:10
  // LUNCH: 13:10-14:00
  // P6: 14:00-14:50 | P7: 14:50-15:40 | P8: 15:40-16:30

  const timetableSlots = [
    // =========================================================================
    // MONDAY
    // =========================================================================
    // P1–P2: FSD — PT
    {
      subjectId: fsd.id,
      facultyId: facPT.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: "08:50",
      endTime: "10:30",
      room: "KC-TF-305",
    },
    // P3–P4: DOMAIN TRAINING
    {
      subjectId: domainTrg.id,
      facultyId: facDomain.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: "10:40",
      endTime: "12:20",
      room: "KC-TF-305",
    },
    // P5: BCS054 — Ms. Komal
    {
      subjectId: bcs054.id,
      facultyId: facKomal.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: "12:20",
      endTime: "13:10",
      room: "KC-TF-305",
    },
    // [LUNCH: 13:10 - 14:00]
    // P6: BCS502 — VK
    {
      subjectId: bcs502.id,
      facultyId: facVK.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: "14:00",
      endTime: "14:50",
      room: "KC-TF-305",
    },
    // P7–P8: BCS503 — RJ
    {
      subjectId: bcs503.id,
      facultyId: facRJ.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: "14:50",
      endTime: "16:30",
      room: "KC-TF-305",
    },

    // =========================================================================
    // TUESDAY
    // =========================================================================
    // P1–P2: DSA — XXX
    {
      subjectId: dsa.id,
      facultyId: facDSA.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.TUESDAY,
      startTime: "08:50",
      endTime: "10:30",
      room: "KC-TF-305",
    },
    // P3: BCS553 — Lab 20 (G1) — RJ
    {
      subjectId: bcs553.id,
      facultyId: facRJ.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.TUESDAY,
      startTime: "10:40",
      endTime: "11:30",
      room: "Lab 20 (G1)",
    },
    // P4: BCS551 — Lab 23 (G2) — TS
    {
      subjectId: bcs551.id,
      facultyId: facTS.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.TUESDAY,
      startTime: "11:30",
      endTime: "12:20",
      room: "Lab 23 (G2)",
    },
    // P5: BCS055 — VAS
    {
      subjectId: bcs055.id,
      facultyId: facVAS.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.TUESDAY,
      startTime: "12:20",
      endTime: "13:10",
      room: "KC-TF-305",
    },
    // [LUNCH: 13:10 - 14:00]
    // P6–P7: FSD — PT
    {
      subjectId: fsd.id,
      facultyId: facPT.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.TUESDAY,
      startTime: "14:00",
      endTime: "15:40",
      room: "KC-TF-305",
    },
    // P8: APPLIED AI — VK
    {
      subjectId: appliedAi.id,
      facultyId: facVK.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.TUESDAY,
      startTime: "15:40",
      endTime: "16:30",
      room: "KC-TF-305",
    },

    // =========================================================================
    // WEDNESDAY
    // =========================================================================
    // P1: BCS501 — TS
    {
      subjectId: bcs501.id,
      facultyId: facTS.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.WEDNESDAY,
      startTime: "08:50",
      endTime: "09:40",
      room: "KC-TF-305",
    },
    // P2: BCS055 — VAS
    {
      subjectId: bcs055.id,
      facultyId: facVAS.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.WEDNESDAY,
      startTime: "09:40",
      endTime: "10:30",
      room: "KC-TF-305",
    },
    // P3: APPLIED AI — VK
    {
      subjectId: appliedAi.id,
      facultyId: facVK.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.WEDNESDAY,
      startTime: "10:40",
      endTime: "11:30",
      room: "KC-TF-305",
    },
    // P4: BCS501 — TS
    {
      subjectId: bcs501.id,
      facultyId: facTS.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.WEDNESDAY,
      startTime: "11:30",
      endTime: "12:20",
      room: "KC-TF-305",
    },
    // P5: BCS503 — RJ
    {
      subjectId: bcs503.id,
      facultyId: facRJ.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.WEDNESDAY,
      startTime: "12:20",
      endTime: "13:10",
      room: "KC-TF-305",
    },
    // [LUNCH: 13:10 - 14:00]
    // P6: BCS502 — VK
    {
      subjectId: bcs502.id,
      facultyId: facVK.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.WEDNESDAY,
      startTime: "14:00",
      endTime: "14:50",
      room: "KC-TF-305",
    },
    // P7–P8: DSA — XXX
    {
      subjectId: dsa.id,
      facultyId: facDSA.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.WEDNESDAY,
      startTime: "14:50",
      endTime: "16:30",
      room: "KC-TF-305",
    },

    // =========================================================================
    // THURSDAY
    // =========================================================================
    // P1–P2: DSA — XXX
    {
      subjectId: dsa.id,
      facultyId: facDSA.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.THURSDAY,
      startTime: "08:50",
      endTime: "10:30",
      room: "KC-TF-305",
    },
    // P3: DOMAIN TRAINING
    {
      subjectId: domainTrg.id,
      facultyId: facDomain.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.THURSDAY,
      startTime: "10:40",
      endTime: "11:30",
      room: "KC-TF-305",
    },
    // P4: BCS502 — VK
    {
      subjectId: bcs502.id,
      facultyId: facVK.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.THURSDAY,
      startTime: "11:30",
      endTime: "12:20",
      room: "KC-TF-305",
    },
    // P5: BCS055 — VAS
    {
      subjectId: bcs055.id,
      facultyId: facVAS.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.THURSDAY,
      startTime: "12:20",
      endTime: "13:10",
      room: "KC-TF-305",
    },
    // [LUNCH: 13:10 - 14:00]
    // P6: SOFT SKILL — MB
    {
      subjectId: softSkill.id,
      facultyId: facMB.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.THURSDAY,
      startTime: "14:00",
      endTime: "14:50",
      room: "KC-TF-305",
    },
    // P7: BCS553 — Lab 20 (G2) — RJ
    {
      subjectId: bcs553.id,
      facultyId: facRJ.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.THURSDAY,
      startTime: "14:50",
      endTime: "15:40",
      room: "Lab 20 (G2)",
    },
    // P8: BCS552 — Lab 23 (G1) — VK
    {
      subjectId: bcs552.id,
      facultyId: facVK.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.THURSDAY,
      startTime: "15:40",
      endTime: "16:30",
      room: "Lab 23 (G1)",
    },

    // =========================================================================
    // FRIDAY
    // =========================================================================
    // P1–P2: QA/LR — Mr. Shiv
    {
      subjectId: qaLr.id,
      facultyId: facShiv.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.FRIDAY,
      startTime: "08:50",
      endTime: "10:30",
      room: "KC-TF-305",
    },
    // P3: BCS503 — RJ
    {
      subjectId: bcs503.id,
      facultyId: facRJ.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.FRIDAY,
      startTime: "10:40",
      endTime: "11:30",
      room: "KC-TF-305",
    },
    // P4: BCS501 — TS
    {
      subjectId: bcs501.id,
      facultyId: facTS.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.FRIDAY,
      startTime: "11:30",
      endTime: "12:20",
      room: "KC-TF-305",
    },
    // P5: BCS054 — Ms. Komal
    {
      subjectId: bcs054.id,
      facultyId: facKomal.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.FRIDAY,
      startTime: "12:20",
      endTime: "13:10",
      room: "KC-TF-305",
    },
    // [LUNCH: 13:10 - 14:00]
    // P6: BCS054 — Ms. Komal
    {
      subjectId: bcs054.id,
      facultyId: facKomal.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.FRIDAY,
      startTime: "14:00",
      endTime: "14:50",
      room: "KC-TF-305",
    },
    // P7: BCS552 — Lab 20 (G2) — Mr. Rishabh
    {
      subjectId: bcs552.id,
      facultyId: facRishabh.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.FRIDAY,
      startTime: "14:50",
      endTime: "15:40",
      room: "Lab 20 (G2)",
    },
    // P8: BCS551 — Lab 23 (G1) — TS
    {
      subjectId: bcs551.id,
      facultyId: facTS.id,
      departmentId: cseDept.id,
      semesterId: sem5.id,
      dayOfWeek: DayOfWeek.FRIDAY,
      startTime: "15:40",
      endTime: "16:30",
      room: "Lab 23 (G1)",
    },
  ];

  for (const slot of timetableSlots) {
    await prisma.timetableEntry.create({ data: slot });
  }

  console.log(`📅 Created ${timetableSlots.length} authoritative timetable slots.`);

  // 11. Attendance Sessions & Records for Abhinav (Realistic Subject Attendance)
  // BCS501 (DBMS): 9 attended out of 13 = 69.2% (Shortage! Needs 3 classes for 75%)
  const dbmsAttendance = [
    { date: "2026-08-03", status: AttendanceStatus.PRESENT },
    { date: "2026-08-05", status: AttendanceStatus.PRESENT },
    { date: "2026-08-07", status: AttendanceStatus.ABSENT },
    { date: "2026-08-10", status: AttendanceStatus.PRESENT },
    { date: "2026-08-12", status: AttendanceStatus.ABSENT },
    { date: "2026-08-14", status: AttendanceStatus.PRESENT },
    { date: "2026-08-17", status: AttendanceStatus.LATE },
    { date: "2026-08-19", status: AttendanceStatus.ABSENT },
    { date: "2026-08-21", status: AttendanceStatus.PRESENT },
    { date: "2026-08-24", status: AttendanceStatus.PRESENT },
    { date: "2026-08-26", status: AttendanceStatus.ABSENT },
    { date: "2026-08-28", status: AttendanceStatus.PRESENT },
    { date: "2026-08-31", status: AttendanceStatus.PRESENT },
  ];

  for (let i = 0; i < dbmsAttendance.length; i++) {
    const item = dbmsAttendance[i];
    const sess = await prisma.attendanceSession.create({
      data: {
        subjectId: bcs501.id,
        facultyId: facTS.id,
        date: new Date(item.date),
        startTime: "08:50",
        endTime: "09:40",
        topic: `BCS501 DBMS Unit ${i + 1}`,
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

  // BCS502 (Web Technology): 12 attended out of 13 = 92.3%
  for (let i = 1; i <= 13; i++) {
    const sess = await prisma.attendanceSession.create({
      data: {
        subjectId: bcs502.id,
        facultyId: facVK.id,
        date: new Date(`2026-08-${String(((i * 2) % 28) + 1).padStart(2, "0")}`),
        startTime: "14:00",
        endTime: "14:50",
        topic: `BCS502 Web Tech Lecture ${i}`,
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

  // BCS503 (DAA): 11 attended out of 12 = 91.7%
  for (let i = 1; i <= 12; i++) {
    const sess = await prisma.attendanceSession.create({
      data: {
        subjectId: bcs503.id,
        facultyId: facRJ.id,
        date: new Date(`2026-08-${String(((i * 2) % 28) + 1).padStart(2, "0")}`),
        startTime: "14:50",
        endTime: "16:30",
        topic: `BCS503 DAA Lecture ${i}`,
      },
    });

    for (const stu of allTargetStudents) {
      await prisma.attendanceRecord.create({
        data: {
          sessionId: sess.id,
          studentId: stu.id,
          status: i === 7 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT,
        },
      });
    }
  }

  // BCS054 & BCS055 Attendance sessions
  for (let i = 1; i <= 10; i++) {
    const sess054 = await prisma.attendanceSession.create({
      data: {
        subjectId: bcs054.id,
        facultyId: facKomal.id,
        date: new Date(`2026-08-${String(((i * 2) % 28) + 1).padStart(2, "0")}`),
        startTime: "12:20",
        endTime: "13:10",
        topic: `BCS054 OOSD C++ Lecture ${i}`,
      },
    });

    for (const stu of allTargetStudents) {
      await prisma.attendanceRecord.create({
        data: {
          sessionId: sess054.id,
          studentId: stu.id,
          status: AttendanceStatus.PRESENT,
        },
      });
    }

    const sess055 = await prisma.attendanceSession.create({
      data: {
        subjectId: bcs055.id,
        facultyId: facVAS.id,
        date: new Date(`2026-08-${String(((i * 2) % 28) + 1).padStart(2, "0")}`),
        startTime: "12:20",
        endTime: "13:10",
        topic: `BCS055 ML Lecture ${i}`,
      },
    });

    for (const stu of allTargetStudents) {
      await prisma.attendanceRecord.create({
        data: {
          sessionId: sess055.id,
          studentId: stu.id,
          status: i === 5 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT,
        },
      });
    }
  }

  // 12. Notices (ABES Engineering College, CSE Section 12)
  await prisma.notice.createMany({
    data: [
      {
        title: "ABES EC: Official Time Table w.e.f. 27.07.2026 for B.Tech CSE (Section 12)",
        content:
          "The official timetable for B.Tech Computer Science & Engineering (Cluster-2), 5th Semester Section 12 is active in Lecture Room KC-TF-305. All students must report to their respective lecture rooms and labs (Lab 20 and Lab 23) as per schedule.",
        category: NoticeCategory.ACADEMIC,
        priority: NoticePriority.HIGH,
        publishedAt: new Date("2026-07-27"),
        createdBy: adminUser.id,
      },
      {
        title: "ABES EC: End-Semester Exam Schedule & Mandatory 75% Attendance Rule",
        content:
          "All B.Tech CSE Section 12 students are hereby informed that AKTU and ABES regulations mandate strict 75% attendance in all courses (including BCS501, BCS502, BCS503, BCS054, BCS055, and Labs) for semester-end exam eligibility.",
        category: NoticeCategory.EXAM,
        priority: NoticePriority.URGENT,
        publishedAt: new Date("2026-08-01"),
        createdBy: adminUser.id,
      },
      {
        title: "CSE-12: Full Stack Development (FSD) & Domain Training Cohorts",
        content:
          "FSD training sessions conducted by Mr. Prashant Tomar (PT) and Domain Training tracks (AI/ML, Cloud Computing, Cyber Security) will run on Mondays and Thursdays as per the published schedule.",
        category: NoticeCategory.ACADEMIC,
        priority: NoticePriority.HIGH,
        publishedAt: new Date("2026-08-05"),
        createdBy: ptUser.id,
      },
      {
        title: "Campus Placement: Tier-1 Tech Drive (Google, Microsoft, Atlassian)",
        content:
          "On-campus placement preparation for 5th semester CSE students with CGPA >= 8.0 begins next month. QA/LR by Mr. Shiv and Soft Skills by Ms. Megha Bajaj are compulsory for all eligible candidates.",
        category: NoticeCategory.PLACEMENT,
        priority: NoticePriority.HIGH,
        publishedAt: new Date("2026-08-10"),
        createdBy: adminUser.id,
      },
    ],
  });

  // 13. Official Knowledge Base Document: ABES Engineering College CSE-12 Timetable Document
  const timetableDoc = await prisma.document.create({
    data: {
      title: "ABES Engineering College Class Time Table 2026-27 (CSE-12, 5th Sem)",
      description: "Official institutional class time table for B.Tech CSE (Cluster-2), 5th Semester Section 12, Classroom KC-TF-305.",
      category: DocumentCategory.ACADEMIC,
      fileName: "ABES_CSE12_Time_Table_2026.pdf",
      fileUrl: "uploads/documents/ABES_CSE12_Time_Table_2026.pdf",
      mimeType: "application/pdf",
      fileSize: 310000,
      uploadedBy: adminUser.id,
      processingStatus: ProcessingStatus.COMPLETED,
    },
  });

  const timetableDocChunks = [
    {
      content: `ABES Engineering College, Ghaziabad - CLASS TIME TABLE
Course: B.Tech
Department: COMPUTER SCIENCE & ENGINEERING (Cluster-2)
Semester/Section: 5th/12 (CSE-12)
Class Room No: KC-TF-305
Session: 2026-27, ODD Semester (w.e.f. 27.07.2026)

Official Period Timings:
- Period 1: 08:50 - 09:40
- Period 2: 09:40 - 10:30
- Period 3: 10:40 - 11:30
- Period 4: 11:30 - 12:20
- Period 5: 12:20 - 13:10
- LUNCH BREAK: 13:10 - 14:00 (1:10 PM - 2:00 PM)
- Period 6: 14:00 - 14:50 (2:00 PM - 2:50 PM)
- Period 7: 14:50 - 15:40 (2:50 PM - 3:40 PM)
- Period 8: 15:40 - 16:30 (3:40 PM - 4:30 PM)`,
      pageNumber: 1,
      chunkIndex: 0,
    },
    {
      content: `ABES EC CSE-12 DAY-WISE SCHEDULE:
MONDAY:
- P1-P2 (08:50-10:30): FSD - Mr. Prashant Tomar (PT), Room: KC-TF-305
- P3-P4 (10:40-12:20): DOMAIN TRAINING, Room: KC-TF-305
- P5 (12:20-13:10): BCS054 Object Oriented System Design with C++ - Ms. Komal, Room: KC-TF-305
- Lunch (13:10-14:00)
- P6 (14:00-14:50): BCS502 Web Technology - Mr. Vikki (VK), Room: KC-TF-305
- P7-P8 (14:50-16:30): BCS503 Design & Analysis of Algorithm - Ms. Ruchi Jain (RJ), Room: KC-TF-305

TUESDAY:
- P1-P2 (08:50-10:30): DSA - Faculty (XXX), Room: KC-TF-305
- P3 (10:40-11:30): BCS553 DAA Lab (G1) - Ms. Ruchi Jain (RJ), Room: Lab 20 (G1)
- P4 (11:30-12:20): BCS551 DBMS Lab (G2) - Ms. Tanvishree (TS), Room: Lab 23 (G2)
- P5 (12:20-13:10): BCS055 Machine Learning Techniques - Ms. Varsha Saxena (VAS), Room: KC-TF-305
- Lunch (13:10-14:00)
- P6-P7 (14:00-15:40): FSD - Mr. Prashant Tomar (PT), Room: KC-TF-305
- P8 (15:40-16:30): APPLIED AI - Mr. Vikki (VK), Room: KC-TF-305`,
      pageNumber: 2,
      chunkIndex: 1,
    },
    {
      content: `WEDNESDAY:
- P1 (08:50-09:40): BCS501 Database Management System - Ms. Tanvishree (TS), Room: KC-TF-305
- P2 (09:40-10:30): BCS055 Machine Learning Techniques - Ms. Varsha Saxena (VAS), Room: KC-TF-305
- P3 (10:40-11:30): APPLIED AI - Mr. Vikki (VK), Room: KC-TF-305
- P4 (11:30-12:20): BCS501 Database Management System - Ms. Tanvishree (TS), Room: KC-TF-305
- P5 (12:20-13:10): BCS503 Design & Analysis of Algorithm - Ms. Ruchi Jain (RJ), Room: KC-TF-305
- Lunch (13:10-14:00)
- P6 (14:00-14:50): BCS502 Web Technology - Mr. Vikki (VK), Room: KC-TF-305
- P7-P8 (14:50-16:30): DSA - Faculty (XXX), Room: KC-TF-305

THURSDAY:
- P1-P2 (08:50-10:30): DSA - Faculty (XXX), Room: KC-TF-305
- P3 (10:40-11:30): DOMAIN TRAINING, Room: KC-TF-305
- P4 (11:30-12:20): BCS502 Web Technology - Mr. Vikki (VK), Room: KC-TF-305
- P5 (12:20-13:10): BCS055 Machine Learning Techniques - Ms. Varsha Saxena (VAS), Room: KC-TF-305
- Lunch (13:10-14:00)
- P6 (14:00-14:50): SOFT SKILL - Ms. Megha Bajaj (MB), Room: KC-TF-305
- P7 (14:50-15:40): BCS553 DAA Lab (G2) - Ms. Ruchi Jain (RJ), Room: Lab 20 (G2)
- P8 (15:40-16:30): BCS552 Web Technology Lab (G1) - Mr. Vikki (VK), Room: Lab 23 (G1)

FRIDAY:
- P1-P2 (08:50-10:30): QA/LR - Mr. Shiv, Room: KC-TF-305
- P3 (10:40-11:30): BCS503 Design & Analysis of Algorithm - Ms. Ruchi Jain (RJ), Room: KC-TF-305
- P4 (11:30-12:20): BCS501 Database Management System - Ms. Tanvishree (TS), Room: KC-TF-305
- P5 (12:20-13:10): BCS054 Object Oriented System Design with C++ - Ms. Komal, Room: KC-TF-305
- Lunch (13:10-14:00)
- P6 (14:00-14:50): BCS054 Object Oriented System Design with C++ - Ms. Komal, Room: KC-TF-305
- P7 (14:50-15:40): BCS552 Web Technology Lab (G2) - Mr. Rishabh, Room: Lab 20 (G2)
- P8 (15:40-16:30): BCS551 Database Management System Lab (G1) - Ms. Tanvishree (TS), Room: Lab 23 (G1)`,
      pageNumber: 3,
      chunkIndex: 2,
    },
    {
      content: `ABES ENGINEERING COLLEGE - FACULTY & SUBJECT DIRECTORY:
- BCS501: Database Management System - Ms. Tanvishree (TS)
- BCS502: Web Technology - Mr. Vikki (VK)
- BCS503: Design & Analysis of Algorithm - Ms. Ruchi Jain (RJ)
- BCS054: Object Oriented System Design with C++ - Ms. Komal
- BCS055: Machine Learning Techniques - Ms. Varsha Saxena (VAS)
- BCS551: Database Management System Lab - Ms. Tanvishree (TS)
- BCS552: Web Technology Lab - Mr. Vikki (VK) / Mr. Rishabh
- BCS553: Design & Analysis of Algorithm Lab - Ms. Ruchi Jain (RJ)
- Applied AI - Mr. Vikki (VK)
- Soft Skill - Ms. Megha Bajaj (MB)
- QA/LR - Mr. Shiv
- FSD - Mr. Prashant Tomar (PT)
- DSA - Faculty (XXX)
- Domain Training - Mr. Aditya Tandon / Dr. Shruti Gupta / Dr. Vipin Sharma`,
      pageNumber: 4,
      chunkIndex: 3,
    },
  ];

  for (const chunk of timetableDocChunks) {
    const embedding = generateDeterministicEmbedding(chunk.content);
    await prisma.documentChunk.create({
      data: {
        documentId: timetableDoc.id,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        pageNumber: chunk.pageNumber,
        embedding: JSON.stringify(embedding),
      },
    });
  }

  // Attendance Ordinance Document
  const docOrdinance = await prisma.document.create({
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

  const docOrdinanceChunks = [
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
  ];

  for (const chunk of docOrdinanceChunks) {
    const embedding = generateDeterministicEmbedding(chunk.content);
    await prisma.documentChunk.create({
      data: {
        documentId: docOrdinance.id,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        pageNumber: chunk.pageNumber,
        embedding: JSON.stringify(embedding),
      },
    });
  }

  console.log("✅ Seed completed successfully with 100% authoritative ABES timetable!");
  console.log("------------------------------------------------------------------");
  console.log("🎓 Student: Abhinav (CSE Section 12, 5th Semester)");
  console.log("🏛️ College: ABES Engineering College, Ghaziabad");
  console.log("🏫 Lecture Room: KC-TF-305");
  console.log("📧 Login: abhinav@campusiq.edu (Password: Password@123)");
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
