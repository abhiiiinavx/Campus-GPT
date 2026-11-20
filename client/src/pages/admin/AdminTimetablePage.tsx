import { useEffect, useState } from "react";
import { timetableService } from "../../services/timetable.service.js";
import { academicService } from "../../services/academic.service.js";
import { TimetableEntry, DayOfWeek } from "../../types/index.js";
import { Badge } from "../../components/common/Badge.js";
import { Button } from "../../components/common/Button.js";
import { Modal } from "../../components/common/Modal.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.js";
import { Plus, Trash2, Clock, MapPin, AlertCircle } from "lucide-react";

export const AdminTimetablePage = () => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectId, setSubjectId] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>("MONDAY");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [room, setRoom] = useState("LH-101");
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTimetable = async () => {
    try {
      const [allEntries, subs, fac] = await Promise.all([
        timetableService.listEntries(),
        academicService.listSubjects(),
        academicService.listFaculty(),
      ]);
      setEntries(allEntries);
      setSubjects(subs.items);
      setFaculty(fac);

      if (subs.items.length > 0) setSubjectId(subs.items[0].id);
      if (fac.length > 0) setFacultyId(fac[0].id);
    } catch (err) {
      console.error("Failed to load timetable manager:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);
    setIsSubmitting(true);

    try {
      const targetSubject = subjects.find((s) => s.id === subjectId);
      const deptId = targetSubject?.departmentId || "dept-1";
      const semId = targetSubject?.semesterId || "sem-1";

      await timetableService.createEntry({
        subjectId,
        facultyId,
        departmentId: deptId,
        semesterId: semId,
        dayOfWeek,
        startTime,
        endTime,
        room,
      });

      setIsModalOpen(false);
      fetchTimetable();
    } catch (err: any) {
      setConflictError(
        err.response?.data?.message ||
          "Schedule conflict detected. Please adjust time or room.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule slot?")) return;
    try {
      await timetableService.deleteEntry(id);
      fetchTimetable();
    } catch (err) {
      console.error("Failed to delete timetable slot:", err);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading university timetable engine..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Master Timetable Builder & Conflict Checker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time conflict prevention for classrooms, faculty
            double-booking, and semester collisions.
          </p>
        </div>

        <Button
          variant="glow"
          size="md"
          onClick={() => {
            setConflictError(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="h-4 w-4" />}
        >
          Add Timetable Slot
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.map((slot) => (
          <div
            key={slot.id}
            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="primary" size="sm">
                  {slot.dayOfWeek}
                </Badge>
                <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-lg">
                  <Clock className="h-3 w-3" />
                  <span>
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                {slot.subject?.name}
              </h3>
              <p className="text-xs text-slate-500 mb-3 font-semibold">
                {slot.subject?.code}
              </p>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 text-xs text-slate-500 flex items-center justify-between">
              <div>
                <span className="block font-semibold text-slate-800 dark:text-slate-200">
                  Room: {slot.room}
                </span>
                <span className="text-[11px] text-slate-400">
                  {slot.faculty?.user?.fullName || "Assigned Faculty"}
                </span>
              </div>

              <button
                onClick={() => handleDelete(slot.id)}
                className="text-rose-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Slot Modal with Conflict Checker */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Schedule Slot (Conflict Validated)"
      >
        <form onSubmit={handleCreateSlot} className="space-y-4">
          {conflictError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{conflictError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Course
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Faculty Member
            </label>
            <select
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
            >
              {faculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.user?.fullName} ({f.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Day
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="MONDAY">Monday</option>
                <option value="TUESDAY">Tuesday</option>
                <option value="WEDNESDAY">Wednesday</option>
                <option value="THURSDAY">Thursday</option>
                <option value="FRIDAY">Friday</option>
                <option value="SATURDAY">Saturday</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Room / Lecture Hall
            </label>
            <input
              type="text"
              required
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. LH-101 or Lab-3"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="glow"
              size="md"
              isLoading={isSubmitting}
            >
              Validate & Schedule Slot
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
