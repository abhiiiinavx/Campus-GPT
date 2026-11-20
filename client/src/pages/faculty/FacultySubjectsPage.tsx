import { useEffect, useState } from "react";
import { academicService } from "../../services/academic.service.js";
import { Badge } from "../../components/common/Badge.js";
import { Button } from "../../components/common/Button.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.js";
import { BookOpen, Users, CalendarCheck } from "lucide-react";
import { Link } from "react-router-dom";

export const FacultySubjectsPage = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const dashboard = await academicService.getFacultyDashboard();
        setSubjects(dashboard.assignedSubjects || []);
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading assigned courses..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Assigned Curriculum Courses
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Courses assigned to you for lecture delivery, syllabus coverage, and
          student attendance tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map((sub) => (
          <div
            key={sub.id}
            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="primary" size="md">
                  {sub.code}
                </Badge>
                <span className="text-xs font-semibold text-slate-400">
                  {sub.credits} Academic Credits
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {sub.name}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-3">
                {sub.description ||
                  "Core departmental module covering foundational and practical competencies."}
              </p>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Semester {sub.semester?.number || 4}
              </span>

              <Link to="/faculty/attendance">
                <Button
                  variant="glow"
                  size="sm"
                  icon={<CalendarCheck className="h-4 w-4" />}
                >
                  Mark Attendance
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
