import { useEffect, useState } from "react";
import { academicService } from "../../services/academic.service.js";
import { Badge } from "../../components/common/Badge.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.js";
import { Briefcase, Mail, BookOpen, Search } from "lucide-react";

export const AdminFacultyPage = () => {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchFaculty = async () => {
    try {
      const data = await academicService.listFaculty();
      setFaculty(data || []);
    } catch (err) {
      console.error("Failed to load faculty:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading faculty directory..." />;
  }

  const filteredFaculty = faculty.filter((f) => {
    const q = search.toLowerCase();
    const name = f.user?.fullName?.toLowerCase() || "";
    const email = f.user?.email?.toLowerCase() || "";
    const empId = f.employeeId?.toLowerCase() || "";
    const designation = f.designation?.toLowerCase() || "";
    const dept = f.department?.name?.toLowerCase() || "";
    return (
      name.includes(q) ||
      email.includes(q) ||
      empId.includes(q) ||
      designation.includes(q) ||
      dept.includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Faculty Directory & Roles
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Faculty appointments, departmental assignments, and teaching responsibilities.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search faculty by name, email, employee ID, or department..."
          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFaculty.map((f) => (
          <div
            key={f.id}
            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="warning" size="sm">
                  {f.employeeId}
                </Badge>
                <Badge variant="success" size="sm">
                  {f.status}
                </Badge>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {f.user?.fullName}
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
                {f.designation}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Department of {f.department?.name}
              </p>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>{f.user?.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
