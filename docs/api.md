# CampusIQ API Reference

All backend endpoints are prefixed with `/api/v1`. Live interactive Swagger UI is available at `/api/v1/docs`.

---

## Authentication (`/api/v1/auth`)

| Method | Endpoint        | Access        | Description                                                                     |
| :----- | :-------------- | :------------ | :------------------------------------------------------------------------------ |
| `POST` | `/auth/signup`  | Public        | Registers a new student. Always forces role to `STUDENT`.                       |
| `POST` | `/auth/login`   | Public        | Authenticates credentials and returns JWT access token + secure refresh cookie. |
| `POST` | `/auth/refresh` | Public        | Rotates refresh token and issues new access token.                              |
| `POST` | `/auth/logout`  | Authenticated | Revokes refresh token and clears session cookie.                                |
| `GET`  | `/auth/me`      | Authenticated | Fetches user profile with linked student or faculty details.                    |

---

## Students (`/api/v1/students`)

| Method | Endpoint                  | Access             | Description                                                                                              |
| :----- | :------------------------ | :----------------- | :------------------------------------------------------------------------------------------------------- |
| `GET`  | `/students/me/dashboard`  | `STUDENT`          | Returns full aggregated student payload in a single query (CGPA, attendance, today's schedule, notices). |
| `GET`  | `/students/me/attendance` | `STUDENT`          | Returns dynamic subject-wise attendance and 75% target requirements.                                     |
| `GET`  | `/students/me/timetable`  | `STUDENT`          | Returns weekly lecture schedule.                                                                         |
| `GET`  | `/students`               | `FACULTY`, `ADMIN` | Lists enrolled students with search and department filtering.                                            |

---

## Attendance (`/api/v1/attendance`)

| Method | Endpoint                   | Access             | Description                                |
| :----- | :------------------------- | :----------------- | :----------------------------------------- |
| `GET`  | `/attendance/me`           | `STUDENT`          | Summary calculation of student attendance. |
| `GET`  | `/attendance/subjects/:id` | Authenticated      | Subject-level attendance breakdown.        |
| `GET`  | `/attendance/sessions`     | Authenticated      | Lists verified attendance sessions.        |
| `POST` | `/attendance/sessions`     | `FACULTY`, `ADMIN` | Creates new lecture session.               |
| `POST` | `/attendance/records/bulk` | `FACULTY`, `ADMIN` | Submits bulk student attendance marks.     |

---

## AI & RAG Engine (`/api/v1/ai`)

| Method | Endpoint   | Access        | Description                                                                             |
| :----- | :--------- | :------------ | :-------------------------------------------------------------------------------------- |
| `POST` | `/ai/chat` | Authenticated | Context-aware AI assistant combining live student data and RAG document knowledge base. |
