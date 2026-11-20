import { useEffect, useState } from "react";
import { academicService } from "../../services/academic.service.js";
import { Enrollment } from "../../types/index.js";
import { Badge } from "../../components/common/Badge.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.js";
import { EmptyState } from "../../components/common/EmptyState.js";
import { BookOpen, User, Award, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const StudentSubjectsPage = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const data = await academicService.listEnrollments();
        setEnrollments(data);
      } catch (err) {
        console.error("Failed to load enrolled subjects:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  if (isLoading) {
    return (
      <LoadingSpinner message="Loading your enrolled academic subjects..." />
    );
  }

  const totalCredits = enrollments.reduce(
    (sum, e) => sum + (e.subject?.credits || 0),
    0,
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header with credit summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Enrolled Academic Courses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Registered courses, assigned faculty mentors, and syllabus
            blueprints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Award className="h-4 w-4 text-indigo-500" />
            <span>
              Total Credits:{" "}
              <strong className="text-indigo-600 dark:text-indigo-400">
                {totalCredits}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {enrollments.length === 0 ? (
        <EmptyState
          title="No Subjects Enrolled"
          description="You are currently not registered in any subjects for this semester."
          icon={<BookOpen className="h-10 w-10 text-indigo-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((e) => {
            const sub = e.subject;
            const facultyName =
              sub.teachingAssignments && sub.teachingAssignments.length > 0
                ? sub.teachingAssignments[0].faculty.user.fullName
                : "Department Faculty";

            return (
              <div
                key={e.id}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm hover:border-indigo-500/50 hover:shadow-glow transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="primary" size="md">
                      {sub.code}
                    </Badge>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 border border-indigo-200 dark:border-indigo-800">
                      {sub.credits} Credits
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                    {sub.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">
                    {sub.description ||
                      "Comprehensive university curriculum module covering fundamental and advanced technical competencies."}
                  </p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <User className="h-4 w-4 text-purple-500 shrink-0" />
                    <span>
                      Faculty:{" "}
                      <strong className="text-slate-900 dark:text-white font-medium">
                        {facultyName}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Enrolled
                    </span>
                    <Link
                      to="/student/attendance"
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View Logs →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
