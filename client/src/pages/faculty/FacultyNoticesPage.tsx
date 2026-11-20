import { useState } from "react";
import { noticeService } from "../../services/notice.service.js";
import { Button } from "../../components/common/Button.js";
import { BellRing, Send, CheckCircle2 } from "lucide-react";

export const FacultyNoticesPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("ACADEMIC");
  const [priority, setPriority] = useState("MEDIUM");
  const [isPublishing, setIsPublishing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsPublishing(true);
    setSuccess(false);

    try {
      await noticeService.createNotice({
        title,
        content,
        category: category as any,
        priority: priority as any,
      });
      setSuccess(true);
      setTitle("");
      setContent("");
    } catch (err) {
      console.error("Failed to publish notice:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Broadcast Campus Notice
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Publish official course bulletins, assignment deadlines, or test
          announcements directly to student portals.
        </p>
      </div>

      {success && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>
            Notice published successfully and live on student dashboard feeds!
          </span>
        </div>
      )}

      <form
        onSubmit={handlePublish}
        className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Notice Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. DBMS Assignment #2 Submission Deadline Extended"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="ACADEMIC">Academic</option>
              <option value="EXAM">Exam</option>
              <option value="EVENT">Event</option>
              <option value="GENERAL">General</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Notice Body / Detailed Content
          </label>
          <textarea
            required
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the full announcement text here..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            variant="glow"
            size="lg"
            isLoading={isPublishing}
            icon={<Send className="h-4 w-4" />}
          >
            Publish Notice
          </Button>
        </div>
      </form>
    </div>
  );
};
