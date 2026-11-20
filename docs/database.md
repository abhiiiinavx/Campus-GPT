# CampusIQ Database Architecture

## Overview

CampusIQ uses **PostgreSQL** paired with **Prisma ORM** for enterprise-grade relational integrity, foreign key cascading, unique constraints, and high-performance indexed queries.

---

## Entity Relationship Summary

```mermaid
erDiagram
    User ||--o| Student : "has"
    User ||--o| Faculty : "has"
    User ||--o{ RefreshToken : "owns"
    User ||--o{ Notice : "authors"
    User ||--o{ Document : "uploads"

    Department ||--o{ Student : "enrolled in"
    Department ||--o{ Faculty : "assigned to"
    Department ||--o{ Subject : "offers"
    Semester ||--o{ Student : "current"
    Semester ||--o{ Subject : "scheduled in"

    Subject ||--o{ Enrollment : "has"
    Student ||--o{ Enrollment : "registers"

    Faculty ||--o{ TeachingAssignment : "teaches"
    Subject ||--o{ TeachingAssignment : "assigned to"

    Faculty ||--o{ AttendanceSession : "conducts"
    Subject ||--o{ AttendanceSession : "session of"
    AttendanceSession ||--o{ AttendanceRecord : "contains"
    Student ||--o{ AttendanceRecord : "logs status"

    Subject ||--o{ TimetableEntry : "scheduled in"
    Faculty ||--o{ TimetableEntry : "instructs"
    Department ||--o{ TimetableEntry : "hosts"
    Semester ||--o{ TimetableEntry : "for"

    Document ||--o{ DocumentChunk : "chunked into"
```

---

## Core Models

1. **User**: UUID primary key, unique email, role (`STUDENT`, `FACULTY`, `ADMIN`), hashed password, audit timestamps, soft delete flag.
2. **Student**: Linked 1:1 with User, roll number unique constraint, department/semester relations, current CGPA.
3. **Faculty**: Linked 1:1 with User, employeeId unique constraint, designation, department relation.
4. **AttendanceSession & AttendanceRecord**: Unique compound constraint `[sessionId, studentId]` preventing double-marking of attendance.
5. **TimetableEntry**: Indexed by day of week and timeslots, validated against room, faculty, and semester conflicts.
6. **Document & DocumentChunk**: Supports chunk storage, page numbers, and 768-dimensional embeddings for RAG vector search.
