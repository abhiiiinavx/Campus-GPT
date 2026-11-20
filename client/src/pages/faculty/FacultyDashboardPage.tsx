import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { academicService } from "../../services/academic.service.js";
import { StatCard } from "../../components/common/StatCard.js";
import { Badge } from "../../components/common/Badge.js";
import { Button } from "../../components/common/Button.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.js";
import {
  BookOpen,
  CalendarCheck,
  Clock,
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

export const FacultyDashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await academicService.getFacultyDashboard();
        setData(res);
      } catch (err) {
        console.error("Failed to load faculty dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading your teaching portal..." />;
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500">
        Unable to load faculty records.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 backdrop-blur-xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
              <Briefcase className="h-3.5 w-3.5" />
              <span>Faculty Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome, {user?.fullName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {data.facultyProfile?.designation} • {data.department?.name} • ID:{" "}
              <strong className="text-white">
                {data.facultyProfile?.employeeId}
              </strong>
            </p>
          </div>

          <div className="flex gap-3">
            <Link to="/faculty/attendance">
              <Button
                variant="glow"
                size="md"
                icon={<CalendarCheck className="h-4 w-4" />}
              >
                Mark Attendance
              </Button>
            </Link>
            <Link to="/faculty/notices">
              <Button variant="outline" size="md">
                Broadcast Notice
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Assigned Courses"
          value={data.stats.totalAssignedSubjects}
          subtitle="Active curriculum modules"
          icon={<BookOpen className="h-5 w-5" />}
          glowColor="indigo"
        />

        <StatCard
          title="Teaching Slots Today"
          value={data.stats.classesToday}
          subtitle="Lectures scheduled today"
          icon={<Clock className="h-5 w-5" />}
          glowColor="amber"
        />

        <StatCard
          title="Sessions Logged"
          value={data.stats.totalSessionsLogged}
          subtitle="Recent verified sessions"
          icon={<CalendarCheck className="h-5 w-5" />}
          glowColor="emerald"
        />
      </div>

      {/* Main Grid: Today's Schedule & Assigned Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Teaching Schedule */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Today's Teaching Schedule
            </h3>
            <Link
              to="/faculty/timetable"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Full Schedule →
            </Link>
          </div>

          {data.todayTimetable.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No teaching classes scheduled for today.
            </div>
          ) : (
            <div className="space-y-3">
              {data.todayTimetable.map((slot: any) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {slot.subject.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Room: <strong>{slot.room}</strong> • Semester{" "}
                      {slot.semester?.number}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="warning" size="sm">
                      {slot.startTime} - {slot.endTime}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Courses Roster */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Assigned Courses
            </h3>
            <Link
              to="/faculty/subjects"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View Roster →
            </Link>
          </div>

          <div className="space-y-3">
            {data.assignedSubjects.map((sub: any) => (
              <div
                key={sub.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      {sub.code}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {sub.credits} Credits
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                    {sub.name}
                  </h4>
                </div>
                <Link to="/faculty/attendance">
                  <Button variant="secondary" size="sm">
                    Mark Attendance
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
