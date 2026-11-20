# CampusIQ

> **Tagline:** _"One AI Platform for Everything on Campus."_

CampusIQ is an AI-powered Smart Campus Operating System integrating student information systems, faculty management, attendance tracking, timetable conflict resolution, campus broadcast notices, document knowledge base ingestion, and a context-aware RAG AI assistant.

---

## 🚀 Key Features

### 🎓 Academic & Student Hub

- **Single-Query Aggregated Dashboard**: Real-time CGPA, subject list, active circulars, today's lecture schedule, and next upcoming lecture.
- **Dynamic 75% Attendance Engine**: Computes exact subject-wise and overall attendance, detects shortage alerts, and calculates the precise number of consecutive classes required to reach 75% examination eligibility (or classes that can be safely missed).
- **Interactive Timetable**: Day-by-day lecture schedule with classroom and faculty metadata.
- **Campus Broadcast Notices**: Category-filtered and priority-sorted official announcements with automated expiration filtering for students.

### 👨‍🏫 Faculty Workspace

- **One-Click Session Logging**: Record lecture attendance with bulk Present/Late/Absent toggling.
- **Teaching Timetable**: Dedicated view of assigned lecture halls and lab slots.
- **Campus Notice Broadcasting**: Publish official announcements directly to student portals.

### 👑 Administration Console

- **User & Roster Management**: Comprehensive student and faculty directories.
- **Curriculum Subject Builder**: Course catalog creation with credit allocation.
- **Master Timetable Builder**: Conflict prevention engine preventing faculty, classroom, and semester collisions (with adjacent slot allowance).
- **RAG Document Ingestion**: Upload PDF, DOCX, and TXT university ordinances with automatic 768-dimensional vector indexing.

### 🤖 Context-Aware AI & RAG Engine

- **Integrated Campus Data**: The AI assistant combines the authenticated user's actual database records (attendance %, timetable, CGPA) with indexed university document excerpts.
- **Grounded Verification**: Answers citations include document title, page number, and snippets.
- **Prompt Injection Defense**: Security guardrails against prompt extraction, hallucinations, and unauthorized administrative overrides.

---

## 🛠️ Technology Stack

### Frontend

- **Framework**: React 19, Vite, TypeScript
- **Styling**: Tailwind CSS (Dark/Light mode, Glassmorphism, Modern Glows)
- **Data & Animation**: `@tanstack/react-query`, Framer Motion, Recharts, Lucide Icons, React Hook Form, Zod
- **Networking**: Centralized Axios API client with automatic token refresh queues

### Backend

- **Framework**: Node.js, Express.js (TypeScript Strict Mode)
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Security**: JWT Access Tokens (15m), HttpOnly Refresh Cookies (7d), Bcrypt (Cost 12), Helmet, CORS, Rate Limiters
- **Documentation**: Swagger / OpenAPI 3.0 at `/api/v1/docs`

### AI & Vector Storage

- **LLM**: Google Gemini 1.5 Flash (`@google/generative-ai`)
- **Embeddings**: 768-dimensional text embeddings (`text-embedding-004`) with deterministic vector fallback
- **RAG Engine**: Semantic text extraction, chunking with overlap, and Top-K cosine similarity retrieval

---

## 🔑 Demo Accounts

The database comes pre-seeded with realistic records and ready-to-test credentials:

| Role                    | Email                       | Password      | Details                                |
| :---------------------- | :-------------------------- | :------------ | :------------------------------------- |
| **Admin**               | `admin@campusiq.edu`        | `Admin@123`   | Dean of Academics                      |
| **Faculty**             | `prof.smith@campusiq.edu`   | `Faculty@123` | Prof. Robert Smith (DBMS, OS)          |
| **Student (Shortage)**  | `alex.student@campusiq.edu` | `Student@123` | Alex Mercer (Shortage in DBMS: 69.23%) |
| **Student (High CGPA)** | `maya.student@campusiq.edu` | `Student@123` | Maya Lin (CGPA: 9.15)                  |

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure the following variables are configured:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/campusiq_db?schema=public
JWT_ACCESS_SECRET=your_jwt_access_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 💻 Local Development & Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Prisma Client & Run Migrations / Push

```bash
npm run prisma:generate
npm run prisma:migrate
# or npm run prisma:push --workspace=server
```

### 3. Seed Database

```bash
npm run seed
```

### 4. Run Development Servers (Client + Server concurrently)

```bash
npm run dev
```

- **Frontend Client**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Swagger Documentation**: http://localhost:5000/api/v1/docs
- **Health Check**: http://localhost:5000/api/v1/health

---

## 🧪 Testing

Run test suites:

```bash
npm run test
```

Includes unit and integration tests for:

- 75% attendance threshold calculation and shortage estimation
- Timetable conflict detection and adjacent slot allowance
- Prompt injection detection and document chunking logic

---

## 📚 Detailed Documentation

- [System Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
- [Database Architecture](docs/database.md)
- [AI & RAG Engine](docs/ai.md)
- [Production Deployment](docs/deployment.md)

---

## 📄 License

MIT © CampusIQ Engineering Team
