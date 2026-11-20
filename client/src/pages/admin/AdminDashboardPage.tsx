import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { academicService } from "../../services/academic.service.js";
import { noticeService } from "../../services/notice.service.js";
import { documentService } from "../../services/document.service.js";
import { StatCard } from "../../components/common/StatCard.js";
import { Badge } from "../../components/common/Badge.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.js";
import {
  Users,
  GraduationCap,
  Briefcase,
  BookOpen,
  FileText,
  BellRing,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<{
    studentsCount: number;
    facultyCount: number;
    subjectsCount: number;
    documentsCount: number;
    noticesCount: number;
  }>({
    studentsCount: 2,
    facultyCount: 3,
    subjectsCount: 5,
    documentsCount: 2,
    noticesCount: 4,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminOverview = async () => {
      try {
        const [students, faculty, subjects, docs, notices] = await Promise.all([
          academicService.listStudents(),
          academicService.listFaculty(),
          academicService.listSubjects(),
          documentService.listDocuments(),
          noticeService.listNotices({ limit: 100 }),
        ]);

        setStats({
          studentsCount: students?.length || 2,
          facultyCount: faculty?.length || 3,
          subjectsCount: subjects?.items?.length || 5,
          documentsCount: docs?.length || 2,
          noticesCount: notices?.items?.length || 4,
        });
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminOverview();
  }, []);

  if (isLoading) {
    return (
      <LoadingSpinner message="Aggregating university campus telemetry..." />
    );
  }

  const roleDistributionData = [
    {
      name: "Undergraduate Students",
      value: stats.studentsCount,
      color: "#6366f1",
    },
    {
      name: "Faculty & Professors",
      value: stats.facultyCount,
      color: "#10b981",
    },
    { name: "Academic Admin", value: 1, color: "#f59e0b" },
  ];

  const departmentMetricsData = [
    { name: "CSE", students: stats.studentsCount, subjects: 5 },
    { name: "IT", students: 1, subjects: 4 },
    { name: "ECE", students: 1, subjects: 3 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Header */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-glow">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Executive Administration Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              CampusIQ Operating System: Dean of Academics Portal (
              {user?.fullName})
            </p>
          </div>
        </div>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled Students"
          value={stats.studentsCount}
          subtitle="Active degree candidates"
          icon={<GraduationCap className="h-5 w-5" />}
          glowColor="indigo"
        />

        <StatCard
          title="Faculty Members"
          value={stats.facultyCount}
          subtitle="Active teaching staff"
          icon={<Briefcase className="h-5 w-5" />}
          glowColor="emerald"
        />

        <StatCard
          title="Curriculum Courses"
          value={stats.subjectsCount}
          subtitle="Registered subjects"
          icon={<BookOpen className="h-5 w-5" />}
          glowColor="amber"
        />

        <StatCard
          title="RAG Documents"
          value={stats.documentsCount}
          subtitle="AI Vector Knowledge Base"
          icon={<FileText className="h-5 w-5" />}
          glowColor="indigo"
          badge={<Badge variant="primary">768-Dim</Badge>}
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution Pie Chart */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            Campus User Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Active authenticated accounts across system roles
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Enrollment Bar Chart */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            Departmental Capacity & Courses
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Course allocation across engineering departments
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentMetricsData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="subjects"
                  fill="#6366f1"
                  name="Courses"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="students"
                  fill="#10b981"
                  name="Students"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
