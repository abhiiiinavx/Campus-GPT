import { useEffect, useState } from "react";
import { academicService } from "../../services/academic.service.js";
import { Badge } from "../../components/common/Badge.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.js";
import { GraduationCap, Award, Mail, Phone, Search } from "lucide-react";

export const AdminStudentsPage = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchStudents = async () => {
    try {
      const data = await academicService.listStudents();
      setStudents(data || []);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading student records..." />;
  }

  const filteredStudents = students.filter((st) => {
    const q = search.toLowerCase();
    const name = st.user?.fullName?.toLowerCase() || "";
    const email = st.user?.email?.toLowerCase() || "";
    const roll = st.rollNumber?.toLowerCase() || "";
    const dept = st.department?.code?.toLowerCase() || "";
    return name.includes(q) || email.includes(q) || roll.includes(q) || dept.includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Student Body Roster
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Enrolled student profiles, academic performance metrics, and registration status.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students by name, email, roll number, or department..."
          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStudents.map((st) => (
          <div
            key={st.id}
            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="primary" size="sm">
                  {st.rollNumber}
                </Badge>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  CGPA: {st.currentCGPA?.toFixed(2)}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {st.user?.fullName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {st.department?.name} • Semester {st.semester?.number}
              </p>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>{st.user?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{st.user?.phone || "No phone recorded"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
