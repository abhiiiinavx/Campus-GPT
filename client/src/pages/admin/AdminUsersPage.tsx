import { useEffect, useState } from "react";
import { academicService } from "../../services/academic.service.js";
import { Badge } from "../../components/common/Badge.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.js";
import { Users, Search, Mail, Shield, CheckCircle2, XCircle } from "lucide-react";

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await academicService.listUsers({
        role: roleFilter !== "ALL" ? roleFilter : undefined,
        search: search.trim() || undefined,
      });
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, search]);

  const handleToggleStatus = async (id: string) => {
    setIsUpdating(id);
    try {
      await academicService.toggleUserStatus(id);
      await fetchUsers();
    } catch (err) {
      console.error("Failed to toggle user status:", err);
    } finally {
      setIsUpdating(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "danger";
      case "FACULTY":
        return "warning";
      default:
        return "primary";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Campus User Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Complete roster of active student candidates, faculty members, and academic administrators.
        </p>
      </div>

      {/* Search and Role Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name or campus email..."
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
          {["ALL", "STUDENT", "FACULTY", "ADMIN"].map((tab) => (
            <button
              key={tab}
              onClick={() => setRoleFilter(tab)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                roleFilter === tab
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab === "ALL" ? "All Users" : tab}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Filtering user records..." />
      ) : (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="pb-3 px-4">Name</th>
                  <th className="pb-3 px-4">Email</th>
                  <th className="pb-3 px-4">Role</th>
                  <th className="pb-3 px-4">Identifier / Dept</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {users.map((u) => {
                  const identifier =
                    u.role === "STUDENT"
                      ? `${u.student?.rollNumber || "Student"} • ${u.student?.department?.code || "CSE"}`
                      : u.role === "FACULTY"
                        ? `${u.faculty?.employeeId || "Faculty"} • ${u.faculty?.department?.name || "Dept"}`
                        : "Institutional Administrator";

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {u.fullName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={getRoleBadgeVariant(u.role)} size="sm">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400">
                        {identifier}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={u.isActive ? "success" : "danger"} size="sm">
                          {u.isActive ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          disabled={isUpdating === u.id}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                            u.isActive
                              ? "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400"
                          }`}
                        >
                          {isUpdating === u.id
                            ? "Updating..."
                            : u.isActive
                              ? "Deactivate"
                              : "Activate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
