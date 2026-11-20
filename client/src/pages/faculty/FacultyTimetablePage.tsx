import { useEffect, useState } from "react";
import { timetableService } from "../../services/timetable.service.js";
import { TimetableEntry, DayOfWeek } from "../../types/index.js";
import { Badge } from "../../components/common/Badge.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.js";
import { EmptyState } from "../../components/common/EmptyState.js";
import { Clock, MapPin, Calendar, Layers } from "lucide-react";

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: "MONDAY", label: "Monday" },
  { key: "TUESDAY", label: "Tuesday" },
  { key: "WEDNESDAY", label: "Wednesday" },
  { key: "THURSDAY", label: "Thursday" },
  { key: "FRIDAY", label: "Friday" },
];

export const FacultyTimetablePage = () => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("MONDAY");

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const data = await timetableService.getFacultyTimetable();
        setEntries(data);
      } catch (err) {
        console.error("Failed to load faculty timetable:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  if (isLoading) {
    return (
      <LoadingSpinner message="Loading your faculty teaching schedule..." />
    );
  }

  const daySlots = entries.filter((e) => e.dayOfWeek === selectedDay);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Faculty Teaching Schedule
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Your allocated lecture halls, lab sessions, and assigned course time
          slots.
        </p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {DAYS.map((d) => (
          <button
            key={d.key}
            onClick={() => setSelectedDay(d.key)}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold transition-all duration-200 shrink-0 ${
              selectedDay === d.key
                ? "bg-indigo-600 text-white shadow-glow"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>{d.label}</span>
          </button>
        ))}
      </div>

      {daySlots.length === 0 ? (
        <EmptyState
          title={`No Teaching Slots on ${selectedDay}`}
          description="You have no classes scheduled for this day."
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
                <Badge variant="primary" size="md">
                  {slot.subject?.code}
                </Badge>
                <div className="flex items-center gap-1.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {slot.subject?.name}
              </h3>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>
                    Room / Lab:{" "}
                    <strong className="text-slate-900 dark:text-white font-semibold">
                      {slot.room}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-500 shrink-0" />
                  <span>
                    Target Class:{" "}
                    <strong className="text-slate-900 dark:text-white font-semibold">
                      {slot.department?.code} - Semester {slot.semester?.number}
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
