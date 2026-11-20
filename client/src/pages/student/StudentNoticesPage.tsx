import { useEffect, useState } from "react";
import { noticeService } from "../../services/notice.service.js";
import { Notice, NoticeCategory } from "../../types/index.js";
import { Badge } from "../../components/common/Badge.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.js";
import { EmptyState } from "../../components/common/EmptyState.js";
import { BellRing, Search, Calendar, User, Filter } from "lucide-react";

const CATEGORIES: { key: string; label: string }[] = [
  { key: "ALL", label: "All Categories" },
  { key: "ACADEMIC", label: "Academic" },
  { key: "EXAM", label: "Examinations" },
  { key: "PLACEMENT", label: "Placements" },
  { key: "EVENT", label: "Events & Clubs" },
  { key: "URGENT", label: "Urgent Alerts" },
];

export const StudentNoticesPage = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await noticeService.listNotices({
          search: search || undefined,
          category:
            selectedCategory !== "ALL"
              ? (selectedCategory as NoticeCategory)
              : undefined,
        });
        setNotices(res.items);
      } catch (err) {
        console.error("Failed to load notices:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotices();
  }, [search, selectedCategory]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Campus Broadcasts & Official Notices
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Official academic announcements, circulars, placement notifications,
          and event bulletins.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search circulars, exams, placement guidelines..."
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`rounded-2xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.key
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Feed */}
      {isLoading ? (
        <LoadingSpinner message="Filtering official university broadcasts..." />
      ) : notices.length === 0 ? (
        <EmptyState
          title="No Notices Found"
          description="There are currently no active broadcasts matching your search query or category."
          icon={<BellRing className="h-10 w-10 text-indigo-400" />}
        />
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`rounded-3xl border p-6 shadow-sm transition-all duration-200 ${
                notice.priority === "URGENT"
                  ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20"
                  : notice.priority === "HIGH"
                    ? "border-amber-300 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      notice.priority === "URGENT"
                        ? "danger"
                        : notice.priority === "HIGH"
                          ? "warning"
                          : "info"
                    }
                    size="sm"
                  >
                    {notice.priority}
                  </Badge>
                  <Badge variant="primary" size="sm">
                    {notice.category}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {new Date(notice.publishedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                {notice.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed mb-4">
                {notice.content}
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                <User className="h-3.5 w-3.5 text-indigo-500" />
                <span>
                  Published by{" "}
                  <strong className="text-slate-700 dark:text-slate-300">
                    {notice.author?.fullName || "Campus Administration"}
                  </strong>{" "}
                  ({notice.author?.role})
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
