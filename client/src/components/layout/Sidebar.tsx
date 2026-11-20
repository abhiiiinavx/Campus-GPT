import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import {
  LayoutDashboard,
  CalendarCheck,
  Clock,
  BookOpen,
  Bell,
  FileText,
  Sparkles,
  Users,
  GraduationCap,
  Briefcase,
  Layers,
  ShieldAlert,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarLink {
  name: string;
  path: string;
  icon: any;
  highlight?: boolean;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user } = useAuth();
  const role = user?.role || "STUDENT";

  const studentLinks: SidebarLink[] = [
    { name: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
    { name: "Attendance", path: "/student/attendance", icon: CalendarCheck },
    { name: "Timetable", path: "/student/timetable", icon: Clock },
    { name: "My Subjects", path: "/student/subjects", icon: BookOpen },
    { name: "Campus Notices", path: "/student/notices", icon: Bell },
    { name: "Documents & Syllabi", path: "/student/documents", icon: FileText },
    {
      name: "CampusIQ AI",
      path: "/student/ai",
      icon: Sparkles,
      highlight: true,
    },
  ];

  const facultyLinks: SidebarLink[] = [
    { name: "Dashboard", path: "/faculty/dashboard", icon: LayoutDashboard },
    {
      name: "Mark Attendance",
      path: "/faculty/attendance",
      icon: CalendarCheck,
    },
    { name: "Teaching Schedule", path: "/faculty/timetable", icon: Clock },
    { name: "My Courses", path: "/faculty/subjects", icon: BookOpen },
    { name: "Broadcast Notice", path: "/faculty/notices", icon: Bell },
  ];

  const adminLinks: SidebarLink[] = [
    { name: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "User Directory", path: "/admin/users", icon: Users },
    { name: "Students", path: "/admin/students", icon: GraduationCap },
    { name: "Faculty", path: "/admin/faculty", icon: Briefcase },
    { name: "Subjects", path: "/admin/subjects", icon: BookOpen },
    { name: "Enrollments", path: "/admin/enrollments", icon: Layers },
    { name: "Timetable Builder", path: "/admin/timetable", icon: Clock },
    {
      name: "Attendance Audit",
      path: "/admin/attendance",
      icon: CalendarCheck,
    },
    { name: "Campus Notices", path: "/admin/notices", icon: Bell },
    { name: "RAG Documents", path: "/admin/documents", icon: FileText },
  ];

  const currentLinks: SidebarLink[] =
    role === "ADMIN"
      ? adminLinks
      : role === "FACULTY"
        ? facultyLinks
        : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-16 z-40 flex h-[calc(100vh-4rem)] w-64 flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-5 transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Header section tag */}
          <div className="px-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {role === "ADMIN"
                ? "Admin Management"
                : role === "FACULTY"
                  ? "Faculty Workspace"
                  : "Student Workspace"}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {currentLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? link.highlight
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow font-semibold"
                          : "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold"
                        : link.highlight
                          ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                    }`
                  }
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* System & AI Badge Footer */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 p-3.5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>CampusIQ AI Live</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Smart Operating System v1.0
          </p>
        </div>
      </aside>
    </>
  );
};
