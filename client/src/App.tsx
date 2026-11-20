import { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth.js";
import { ThemeProvider } from "./hooks/useTheme.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardLayout } from "./components/layout/DashboardLayout.js";
import { LoadingSpinner } from "./components/common/LoadingSpinner.js";

// Auth Pages
import { LoginPage } from "./pages/auth/LoginPage.js";
import { SignupPage } from "./pages/auth/SignupPage.js";

// Student Pages
import { StudentDashboardPage } from "./pages/student/StudentDashboardPage.js";
import { StudentAttendancePage } from "./pages/student/StudentAttendancePage.js";
import { StudentTimetablePage } from "./pages/student/StudentTimetablePage.js";
import { StudentSubjectsPage } from "./pages/student/StudentSubjectsPage.js";
import { StudentNoticesPage } from "./pages/student/StudentNoticesPage.js";
import { StudentDocumentsPage } from "./pages/student/StudentDocumentsPage.js";
import { StudentAIPage } from "./pages/student/StudentAIPage.js";

// Faculty Pages
import { FacultyDashboardPage } from "./pages/faculty/FacultyDashboardPage.js";
import { FacultyAttendancePage } from "./pages/faculty/FacultyAttendancePage.js";
import { FacultyTimetablePage } from "./pages/faculty/FacultyTimetablePage.js";
import { FacultySubjectsPage } from "./pages/faculty/FacultySubjectsPage.js";
import { FacultyNoticesPage } from "./pages/faculty/FacultyNoticesPage.js";

// Admin Pages
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage.js";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage.js";
import { AdminStudentsPage } from "./pages/admin/AdminStudentsPage.js";
import { AdminFacultyPage } from "./pages/admin/AdminFacultyPage.js";
import { AdminSubjectsPage } from "./pages/admin/AdminSubjectsPage.js";
import { AdminEnrollmentsPage } from "./pages/admin/AdminEnrollmentsPage.js";
import { AdminAttendancePage } from "./pages/admin/AdminAttendancePage.js";
import { AdminTimetablePage } from "./pages/admin/AdminTimetablePage.js";
import { AdminNoticesPage } from "./pages/admin/AdminNoticesPage.js";
import { AdminDocumentsPage } from "./pages/admin/AdminDocumentsPage.js";

import { NotFoundPage } from "./pages/NotFoundPage.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Guard: Redirects to appropriate role dashboard or login
const RootRedirect = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner message="Initializing CampusIQ..." />;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "FACULTY")
    return <Navigate to="/faculty/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

// Protected Route Wrapper
const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: string[];
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <LoadingSpinner message="Verifying campus identity credentials..." />
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Root */}
              <Route path="/" element={<RootRedirect />} />

              {/* Public Auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["STUDENT", "ADMIN"]}>
                    <StudentDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/attendance"
                element={
                  <ProtectedRoute allowedRoles={["STUDENT", "ADMIN"]}>
                    <StudentAttendancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/timetable"
                element={
                  <ProtectedRoute allowedRoles={["STUDENT", "ADMIN"]}>
                    <StudentTimetablePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/subjects"
                element={
                  <ProtectedRoute allowedRoles={["STUDENT", "ADMIN"]}>
                    <StudentSubjectsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/notices"
                element={
                  <ProtectedRoute
                    allowedRoles={["STUDENT", "ADMIN", "FACULTY"]}
                  >
                    <StudentNoticesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/documents"
                element={
                  <ProtectedRoute
                    allowedRoles={["STUDENT", "ADMIN", "FACULTY"]}
                  >
                    <StudentDocumentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/ai"
                element={
                  <ProtectedRoute
                    allowedRoles={["STUDENT", "ADMIN", "FACULTY"]}
                  >
                    <StudentAIPage />
                  </ProtectedRoute>
                }
              />

              {/* Faculty Routes */}
              <Route
                path="/faculty/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["FACULTY", "ADMIN"]}>
                    <FacultyDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/attendance"
                element={
                  <ProtectedRoute allowedRoles={["FACULTY", "ADMIN"]}>
                    <FacultyAttendancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/timetable"
                element={
                  <ProtectedRoute allowedRoles={["FACULTY", "ADMIN"]}>
                    <FacultyTimetablePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/subjects"
                element={
                  <ProtectedRoute allowedRoles={["FACULTY", "ADMIN"]}>
                    <FacultySubjectsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/notices"
                element={
                  <ProtectedRoute allowedRoles={["FACULTY", "ADMIN"]}>
                    <FacultyNoticesPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminStudentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/faculty"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminFacultyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/subjects"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminSubjectsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/enrollments"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminEnrollmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/attendance"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminAttendancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/timetable"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminTimetablePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notices"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminNoticesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/documents"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminDocumentsPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-all */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
