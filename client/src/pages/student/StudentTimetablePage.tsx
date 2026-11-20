import { useEffect, useState } from "react";
import { timetableService } from "../../services/timetable.service.js";
import { DayOfWeek, TimetableEntry } from "../../types/index.js";
import { Badge } from "../../components/common/Badge.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.js";
import { EmptyState } from "../../components/common/EmptyState.js";
import { Clock, MapPin, User, Calendar, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: "MONDAY", label: "Monday" },
  { key: "TUESDAY", label: "Tuesday" },
  { key: "WEDNESDAY", label: "Wednesday" },
  { key: "THURSDAY", label: "Thursday" },
  { key: "FRIDAY", label: "Friday" },
  { key: "SATURDAY", label: "Saturday" },
];

export const StudentTimetablePage = () => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getCurrentDayKey = (): DayOfWeek => {
    const dayIndex = new Date().getDay();
    const dayMap: Record<number, DayOfWeek> = {
      1: "MONDAY",
      2: "TUESDAY",
      3: "WEDNESDAY",
      4: "THURSDAY",
      5: "FRIDAY",
      6: "SATURDAY",
      0: "MONDAY", // fallback for Sunday
    };
    return dayMap[dayIndex] || "MONDAY";
  };

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getCurrentDayKey());

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const data = await timetableService.getStudentTimetable();
        setEntries(data);
      } catch (err) {
        console.error("Failed to load timetable:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  if (isLoading) {
    return (
      <LoadingSpinner message="Fetching your semester timetable schedule..." />
    );
  }

  const daySlots = entries
    .filter((e) => e.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Academic Timetable & Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Interactive weekly schedule with room allocations and professor
            details.
          </p>
        </div>

        <Link
          to="/student/ai"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          <span>Ask AI "What classes today?"</span>
        </Link>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {DAYS.map((d) => (
          <button
            key={d.key}
            onClick={() => setSelectedDay(d.key)}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold transition-all duration-200 shrink-0 ${
              selectedDay === d.key
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>{d.label}</span>
            {d.key === getCurrentDayKey() && (
              <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
                Today
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Slots List */}
      {daySlots.length === 0 ? (
        <EmptyState
          title={`No classes scheduled for ${selectedDay}`}
          description="You have no scheduled lectures for this day. Check other days or ask the AI assistant."
          icon={<Clock className="h-10 w-10 text-indigo-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {daySlots.map((slot) => (
            <div
              key={slot.id}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm hover:border-indigo-500/50 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="md">
                    {slot.subject.code}
                  </Badge>
                  <span className="text-xs text-slate-400 font-medium">
                    {slot.subject.credits} Credits
                  </span>
                </div>

                <div className="flex items-center gap-1.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {slot.subject.name}
              </h3>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>
                    Classroom / Hall:{" "}
                    <strong className="text-slate-900 dark:text-white font-semibold">
                      {slot.room}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-500 shrink-0" />
                  <span>
                    Faculty In-Charge:{" "}
                    <strong className="text-slate-900 dark:text-white font-semibold">
                      {slot.faculty.user.fullName}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
