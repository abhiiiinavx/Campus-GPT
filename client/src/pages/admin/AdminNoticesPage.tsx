import { useEffect, useState } from "react";
import { noticeService } from "../../services/notice.service.js";
import { Notice } from "../../types/index.js";
import { Badge } from "../../components/common/Badge.js";
import { Button } from "../../components/common/Button.js";
import { Modal } from "../../components/common/Modal.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.js";
import { BellRing, Plus, Trash2, Calendar } from "lucide-react";

export const AdminNoticesPage = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("ACADEMIC");
  const [priority, setPriority] = useState("MEDIUM");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotices = async () => {
    try {
      const res = await noticeService.listNotices({
        includeExpired: true,
        limit: 50,
      });
      setNotices(res.items);
    } catch (err) {
      console.error("Failed to load notices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSubmitting(true);
    try {
      await noticeService.createNotice({
        title,
        content,
        category: category as any,
        priority: priority as any,
      });
      setIsModalOpen(false);
      setTitle("");
      setContent("");
      fetchNotices();
    } catch (err) {
      console.error("Failed to publish notice:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      await noticeService.deleteNotice(id);
      fetchNotices();
    } catch (err) {
      console.error("Failed to delete notice:", err);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading circulars..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Campus Broadcast Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Publish, edit, and manage university-wide circulars and priority
            bulletins.
          </p>
        </div>

        <Button
          variant="glow"
          size="md"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          Publish Notice
        </Button>
      </div>

      <div className="space-y-4">
        {notices.map((n) => (
          <div
            key={n.id}
            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    n.priority === "URGENT"
                      ? "danger"
                      : n.priority === "HIGH"
                        ? "warning"
                        : "info"
                  }
                  size="sm"
                >
                  {n.priority}
                </Badge>
                <Badge variant="primary" size="sm">
                  {n.category}
                </Badge>
                <span className="text-[11px] text-slate-400">
                  {new Date(n.publishedAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {n.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                {n.content}
              </p>
            </div>

            <button
              onClick={() => handleDelete(n.id)}
              className="text-rose-500 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors self-end md:self-center"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Official Broadcast"
      >
        <form onSubmit={handleCreateNotice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notice Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. End Semester Exam Registration Dates"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="ACADEMIC">Academic</option>
                <option value="EXAM">Exam</option>
                <option value="PLACEMENT">Placement</option>
                <option value="EVENT">Event</option>
                <option value="GENERAL">General</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notice Body
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Full announcement text..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
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
              Publish Broadcast
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
