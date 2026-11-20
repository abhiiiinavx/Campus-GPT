import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { academicService } from "../../services/academic.service.js";
import { StudentDashboardData } from "../../types/index.js";
import { StatCard } from "../../components/common/StatCard.js";
import { Badge } from "../../components/common/Badge.js";
import { Button } from "../../components/common/Button.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.js";
import {
  GraduationCap,
  CalendarCheck,
  BookOpen,
  Clock,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
  BellRing,
  Award,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

export const StudentDashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await academicService.getStudentDashboard();
        setData(res);
      } catch (err) {
        console.error("Failed to load student dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <LoadingSpinner message="Assembling your personalized academic dashboard..." />
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500">
        Unable to load student records. Please try again.
      </div>
    );
  }

  const chartData = data.attendance.subjectsSummary.map((sub) => ({
    name: sub.subjectCode,
    attendance: sub.attendancePercentage,
    isShortage: sub.isShortage,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Welcome & AI Assistant Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>CampusIQ Smart Student Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.fullName}!
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              {data.department?.name} • Semester {data.semester?.number} • Roll
              No:{" "}
              <span className="font-semibold text-white">
                {data.studentProfile?.rollNumber}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/student/ai">
              <Button
                variant="glow"
                size="md"
                icon={<Sparkles className="h-4 w-4" />}
              >
                Ask CampusIQ AI
              </Button>
            </Link>
            <Link to="/student/attendance">
              <Button
                variant="outline"
                size="md"
                icon={<CalendarCheck className="h-4 w-4" />}
              >
                View Attendance
              </Button>
            </Link>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* 2. Attendance Warning Alert if Shortage */}
      {data.shortageSubjects.length > 0 && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 sm:p-5 backdrop-blur-md">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-500 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-300">
                Attendance Shortage Warning ({data.shortageSubjects.length}{" "}
                Subject Below 75%)
              </h3>
              <p className="text-xs text-rose-700/80 dark:text-rose-300/80">
                Campus regulations require at least 75% attendance. You are
                currently below threshold in:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.shortageSubjects.map((sub) => (
                  <span
                    key={sub.subjectId}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/20 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-200"
                  >
                    <strong>{sub.subjectCode}</strong> (
                    {sub.attendancePercentage}%) - Attend next{" "}
                    <span className="underline">
                      {sub.classesNeededFor75} classes
                    </span>
                  </span>
                ))}
              </div>
            </div>
            <Link to="/student/attendance" className="shrink-0 hidden sm:block">
              <Button variant="danger" size="sm">
                Details
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 3. Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Overall Attendance"
          value={`${data.quickStats.attendancePercentage}%`}
          subtitle={`${data.attendance.presentClasses + data.attendance.lateClasses} of ${data.attendance.totalClasses} classes`}
          icon={<CalendarCheck className="h-5 w-5" />}
          glowColor={data.attendance.isShortage ? "rose" : "emerald"}
          badge={
            <Badge variant={data.attendance.isShortage ? "danger" : "success"}>
              {data.attendance.isShortage ? "Shortage" : "Safe"}
            </Badge>
          }
        />

        <StatCard
          title="Cumulative CGPA"
          value={data.quickStats.currentCGPA.toFixed(2)}
          subtitle="Top 15% in Department"
          icon={<Award className="h-5 w-5" />}
          glowColor="indigo"
          badge={<Badge variant="info">Scale: 10.0</Badge>}
        />

        <StatCard
          title="Registered Subjects"
          value={data.quickStats.totalSubjects}
          subtitle={`${data.enrolledSubjects.reduce((acc, s) => acc + s.credits, 0)} Total Credits`}
          icon={<BookOpen className="h-5 w-5" />}
          glowColor="indigo"
        />

        <StatCard
          title="Lectures Today"
          value={data.quickStats.classesToday}
          subtitle={
            data.nextClass
              ? `Next: ${data.nextClass.subject.name}`
              : "All done for today"
          }
          icon={<Clock className="h-5 w-5" />}
          glowColor="amber"
          badge={
            data.nextClass ? (
              <Badge variant="warning" size="sm">
                {data.nextClass.startTime}
              </Badge>
            ) : undefined
          }
        />
      </div>

      {/* 4. Two-Column Dashboard Content: Schedule & Subject Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Subject Attendance Chart & Timetable */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Chart Card */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Subject-Wise Attendance Overview
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time percentage vs. 75% threshold
                </p>
              </div>
              <Link
                to="/student/attendance"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                Full Log <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
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
                    domain={[0, 100]}
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
                    formatter={(val: number) => [`${val}%`, "Attendance"]}
                  />
                  <Bar dataKey="attendance" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isShortage ? "#ef4444" : "#6366f1"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Today's Schedule Card */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Today's Lecture Schedule
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {data.todayTimetable.length} lecture slots scheduled
                </p>
              </div>
              <Link
                to="/student/timetable"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                Weekly Timetable <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {data.todayTimetable.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No classes scheduled for today! Enjoy your self-study time.
              </div>
            ) : (
              <div className="space-y-3">
                {data.todayTimetable.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 p-4 hover:border-indigo-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex flex-col items-center justify-center rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 px-3 py-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                        <span>{slot.startTime}</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          to
                        </span>
                        <span>{slot.endTime}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {slot.subject.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Room:{" "}
                          <strong className="text-slate-700 dark:text-slate-300">
                            {slot.room}
                          </strong>{" "}
                          • {slot.faculty.user.fullName}
                        </p>
                      </div>
                    </div>
                    <Badge variant="info" size="sm">
                      {slot.subject.code}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Important Notices & Quick AI Prompt Box */}
        <div className="space-y-6">
          {/* Quick AI Query Box */}
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-slate-900/30 p-6 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-2">
              <Sparkles className="h-4 w-4" />
              <span>CampusIQ AI Assistant</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
              Get instant answers calculated directly against your attendance,
              syllabus, and university regulations.
            </p>

            <div className="space-y-2 mb-4">
              <Link
                to="/student/ai"
                className="block rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/80 p-2.5 text-xs text-slate-700 dark:text-slate-300 hover:border-indigo-500 transition-colors"
              >
                💬 "How many classes do I need to reach 75% in DBMS?"
              </Link>
              <Link
                to="/student/ai"
                className="block rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/80 p-2.5 text-xs text-slate-700 dark:text-slate-300 hover:border-indigo-500 transition-colors"
              >
                💬 "What is the official exam condonation rule?"
              </Link>
            </div>

            <Link to="/student/ai" className="w-full block">
              <Button variant="glow" size="sm" className="w-full">
                Open AI Chatroom
              </Button>
            </Link>
          </div>

          {/* Latest Campus Notices */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BellRing className="h-4 w-4 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Campus Broadcasts
                </h3>
              </div>
              <Link
                to="/student/notices"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                All
              </Link>
            </div>

            <div className="space-y-3.5">
              {data.latestNotices.slice(0, 3).map((notice) => (
                <div
                  key={notice.id}
                  className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-3.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        notice.priority === "URGENT"
                          ? "danger"
                          : notice.priority === "HIGH"
                            ? "warning"
                            : "info"
                      }
                      size="sm"
                    >
                      {notice.priority}
                    </Badge>
                    <span className="text-[10px] text-slate-400">
                      {new Date(notice.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {notice.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {notice.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
