import { useEffect, useState } from "react";
import { attendanceService } from "../../services/attendance.service.js";
import { OverallAttendanceSummary } from "../../types/index.js";
import { StatCard } from "../../components/common/StatCard.js";
import { Badge } from "../../components/common/Badge.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.js";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

export const StudentAttendancePage = () => {
  const [data, setData] = useState<{
    summary: OverallAttendanceSummary;
    rawRecords: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | "ALL">(
    "ALL",
  );

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await attendanceService.getMyAttendance();
        setData(res);
      } catch (err) {
        console.error("Failed to load attendance:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (isLoading) {
    return (
      <LoadingSpinner message="Calculating dynamic subject attendance metrics..." />
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500">
        No attendance records found.
      </div>
    );
  }

  const { summary, rawRecords } = data;

  const filteredRecords =
    selectedSubjectId === "ALL"
      ? rawRecords
      : rawRecords.filter((r) => r.session?.subjectId === selectedSubjectId);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Academic Attendance & Compliance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time dynamically calculated attendance with 75% examination
            threshold tracker.
          </p>
        </div>

        <Link
          to="/student/ai"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          <span>Ask AI Attendance Policy</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Aggregate Attendance"
          value={`${summary.overallPercentage}%`}
          subtitle={`Goal: ≥ 75.0% Mandatory`}
          icon={<CalendarCheck className="h-5 w-5" />}
          glowColor={summary.isShortage ? "rose" : "emerald"}
          badge={
            <Badge variant={summary.isShortage ? "danger" : "success"}>
              {summary.isShortage ? "Shortage Alert" : "Compliant"}
            </Badge>
          }
        />

        <StatCard
          title="Total Attended"
          value={summary.presentClasses + summary.lateClasses}
          subtitle={`Out of ${summary.totalClasses} total lectures`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          glowColor="emerald"
        />

        <StatCard
          title="Lectures Missed"
          value={summary.absentClasses}
          subtitle="Absences recorded"
          icon={<XCircle className="h-5 w-5" />}
          glowColor="rose"
        />

        <StatCard
          title="Shortage Subjects"
          value={summary.subjectsSummary.filter((s) => s.isShortage).length}
          subtitle="Courses below 75%"
          icon={<AlertTriangle className="h-5 w-5" />}
          glowColor={
            summary.subjectsSummary.some((s) => s.isShortage)
              ? "rose"
              : "indigo"
          }
        />
      </div>

      {/* Subject-Wise Detailed Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Subject-Wise Status & 75% Requirement Calculator
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary.subjectsSummary.map((sub) => (
            <div
              key={sub.subjectId}
              className={`rounded-3xl border p-5 shadow-sm transition-all duration-200 ${
                sub.isShortage
                  ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      {sub.subjectCode}
                    </Badge>
                    <span className="text-xs text-slate-400 font-medium">
                      {sub.credits} Credits
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {sub.subjectName}
                  </h3>
                </div>

                <span
                  className={`text-2xl font-extrabold ${
                    sub.isShortage
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-indigo-600 dark:text-indigo-400"
                  }`}
                >
                  {sub.attendancePercentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden mb-3">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    sub.isShortage ? "bg-rose-500" : "bg-indigo-600"
                  }`}
                  style={{
                    width: `${Math.min(sub.attendancePercentage, 100)}%`,
                  }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center py-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl mb-3">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                    Attended
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {sub.presentClasses + sub.lateClasses}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                    Absent
                  </span>
                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                    {sub.absentClasses}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                    Total
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {sub.totalClasses}
                  </span>
                </div>
              </div>

              {/* Dynamic 75% Action Callout */}
              {sub.isShortage ? (
                <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-600 dark:text-rose-300 font-medium">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    Must attend next{" "}
                    <strong>
                      {sub.classesNeededFor75} consecutive classes
                    </strong>{" "}
                    to reach 75%.
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-300 font-medium">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>
                    Attendance is safe. You can miss up to{" "}
                    <strong>{sub.classesCanMissToStayAbove75} classes</strong>{" "}
                    and remain ≥ 75%.
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Session History Log */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Session Attendance History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified attendance logs recorded by faculty members
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedSubjectId("ALL")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedSubjectId === "ALL"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              All Subjects
            </button>
            {summary.subjectsSummary.map((s) => (
              <button
                key={s.subjectId}
                onClick={() => setSelectedSubjectId(s.subjectId)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors shrink-0 ${
                  selectedSubjectId === s.subjectId
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                {s.subjectCode}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="pb-3 px-4">Date</th>
                <th className="pb-3 px-4">Subject</th>
                <th className="pb-3 px-4">Topic / Session</th>
                <th className="pb-3 px-4">Time</th>
                <th className="pb-3 px-4">Faculty</th>
                <th className="pb-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredRecords.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                    {new Date(record.session?.date).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                    {record.session?.subject?.code}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    {record.session?.topic || "Class Lecture"}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                    {record.session?.startTime} - {record.session?.endTime}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    {record.session?.faculty?.user?.fullName ||
                      "Faculty Member"}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        record.status === "PRESENT"
                          ? "success"
                          : record.status === "LATE"
                            ? "warning"
                            : "danger"
                      }
                      size="sm"
                    >
                      {record.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
