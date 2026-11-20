import { useEffect, useState } from "react";
import { attendanceService } from "../../services/attendance.service.js";
import { AttendanceSession } from "../../types/index.js";
import { Badge } from "../../components/common/Badge.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.js";

export const AdminAttendancePage = () => {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await attendanceService.listSessions();
        setSessions(data);
      } catch (err) {
        console.error("Failed to load sessions:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  if (isLoading) {
    return (
      <LoadingSpinner message="Auditing institutional attendance logs..." />
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Attendance Audit & Sessions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Campus-wide lecture sessions logged by faculty with recorded student
          attendance marks.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="pb-3 px-4">Date</th>
                <th className="pb-3 px-4">Course</th>
                <th className="pb-3 px-4">Topic</th>
                <th className="pb-3 px-4">Time Slot</th>
                <th className="pb-3 px-4">Faculty Member</th>
                <th className="pb-3 px-4">Records Logged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {sessions.map((sess) => (
                <tr
                  key={sess.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {new Date(sess.date).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                    {sess.subject?.code} - {sess.subject?.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    {sess.topic || "Class Lecture"}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {sess.startTime} - {sess.endTime}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Faculty In-Charge
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="success" size="sm">
                      {sess.records?.length || 2} Students Verified
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
