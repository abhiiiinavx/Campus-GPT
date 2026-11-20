import { useEffect, useState } from "react";
import { academicService } from "../../services/academic.service.js";
import { attendanceService } from "../../services/attendance.service.js";
import { Button } from "../../components/common/Button.js";
import { Badge } from "../../components/common/Badge.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.js";
import {
  CalendarCheck,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export const FacultyAttendancePage = () => {
  const [assignedSubjects, setAssignedSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states for new session
  const [sessionDate, setSessionDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [topic, setTopic] = useState("");

  // Attendance map: studentId -> 'PRESENT' | 'ABSENT' | 'LATE'
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, "PRESENT" | "ABSENT" | "LATE">
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const dashboard = await academicService.getFacultyDashboard();
        setAssignedSubjects(dashboard.assignedSubjects || []);
        if (
          dashboard.assignedSubjects &&
          dashboard.assignedSubjects.length > 0
        ) {
          setSelectedSubjectId(dashboard.assignedSubjects[0].id);
        }
      } catch (err) {
        console.error("Failed to load faculty courses:", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedSubjectId) return;

    const fetchStudentsForSubject = async () => {
      try {
        const enrollments = await academicService.listEnrollments({
          subjectId: selectedSubjectId,
        });
        const enrolledStudents = enrollments.map((e: any) => e.student);
        setStudents(enrolledStudents);

        // Default all to PRESENT
        const initialMap: Record<string, "PRESENT" | "ABSENT" | "LATE"> = {};
        enrolledStudents.forEach((st: any) => {
          initialMap[st.id] = "PRESENT";
        });
        setAttendanceMap(initialMap);
      } catch (err) {
        console.error("Failed to load students for subject:", err);
      }
    };

    fetchStudentsForSubject();
  }, [selectedSubjectId]);

  const handleStatusChange = (
    studentId: string,
    status: "PRESENT" | "ABSENT" | "LATE",
  ) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: "PRESENT" | "ABSENT") => {
    const updated: Record<string, "PRESENT" | "ABSENT" | "LATE"> = {};
    students.forEach((st) => {
      updated[st.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || students.length === 0) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      // 1. Create session
      const session = await attendanceService.createSession({
        subjectId: selectedSubjectId,
        date: sessionDate,
        startTime,
        endTime,
        topic: topic || "Standard Lecture Session",
      });

      // 2. Mark bulk attendance records
      const records = Object.entries(attendanceMap).map(
        ([studentId, status]) => ({
          studentId,
          status,
        }),
      );

      await attendanceService.markBulkAttendance({
        sessionId: session.id,
        records,
      });

      setStatusMessage({
        type: "success",
        text: `Attendance session logged successfully for ${records.length} students!`,
      });
      setTopic("");
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text:
          err.response?.data?.message || "Failed to submit attendance session.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading course enrollment roster..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Mark Lecture Attendance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Create verified attendance sessions and record live attendance logs
          for enrolled students.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`rounded-2xl border p-4 text-xs font-semibold ${
            statusMessage.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmitAttendance} className="space-y-6">
        {/* Session Details Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            1. Lecture Session Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Course
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
              >
                {assignedSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Session Date
              </label>
              <input
                type="date"
                required
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Topic / Lecture Description (Optional)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Relational Calculus and Query Optimization"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Student Roster Attendance List */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                2. Student Attendance Roster ({students.length} Enrolled)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mark status for each student
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleMarkAll("PRESENT")}
              >
                Mark All Present
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleMarkAll("ABSENT")}
              >
                Mark All Absent
              </Button>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No students enrolled in this course yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map((st) => {
                const currentStatus = attendanceMap[st.id] || "PRESENT";

                return (
                  <div
                    key={st.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {st.user?.fullName}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Roll:{" "}
                        <strong className="text-slate-700 dark:text-slate-300">
                          {st.rollNumber}
                        </strong>{" "}
                        • CGPA: {st.currentCGPA}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(st.id, "PRESENT")}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                          currentStatus === "PRESENT"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        }`}
                      >
                        Present
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(st.id, "LATE")}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                          currentStatus === "LATE"
                            ? "bg-amber-600 text-white shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                        }`}
                      >
                        Late
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(st.id, "ABSENT")}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                          currentStatus === "ABSENT"
                            ? "bg-rose-600 text-white shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button
              type="submit"
              variant="glow"
              size="lg"
              isLoading={isSubmitting}
              disabled={students.length === 0}
              icon={<CheckCircle2 className="h-4 w-4" />}
            >
              Submit Verified Attendance
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
