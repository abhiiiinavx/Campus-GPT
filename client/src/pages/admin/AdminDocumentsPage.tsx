import { useEffect, useState } from "react";
import { documentService } from "../../services/document.service.js";
import { DocumentItem } from "../../types/index.js";
import { Badge } from "../../components/common/Badge.js";
import { Button } from "../../components/common/Button.js";
import { Modal } from "../../components/common/Modal.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.js";
import {
  FileText,
  Plus,
  Trash2,
  UploadCloud,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export const AdminDocumentsPage = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Upload Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("ACADEMIC");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchDocs = async () => {
    try {
      const data = await documentService.listDocuments();
      setDocuments(data);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) {
      setUploadError("Title and file are required.");
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("file", file);

      await documentService.uploadDocument(formData);
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setFile(null);
      fetchDocs();
    } catch (err: any) {
      setUploadError(
        err.response?.data?.message ||
          "Document upload or RAG processing failed.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Delete this document and purge all associated vector embeddings?",
      )
    )
      return;
    try {
      await documentService.deleteDocument(id);
      fetchDocs();
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Querying RAG Vector Knowledge Base..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            RAG Document & Vector Knowledge Base
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Upload institutional policy PDFs, ordinances, and handbooks to index
            into CampusIQ AI 768-dim embeddings.
          </p>
        </div>

        <Button
          variant="glow"
          size="md"
          onClick={() => {
            setUploadError(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="h-4 w-4" />}
        >
          Index New Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="primary" size="sm">
                  {doc.category}
                </Badge>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Vector Indexed
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                {doc.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                {doc.description ||
                  "Institutional document available for AI grounded answers."}
              </p>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
              <div className="text-[11px] text-slate-400">
                <span>{doc.fileName}</span>
              </div>

              <button
                onClick={() => handleDelete(doc.id)}
                className="text-rose-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload & Ingest Document into RAG Knowledge Base"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          {uploadError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-600 dark:text-rose-400">
              {uploadError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Document Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Student Code of Conduct & Library Regulations 2026"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

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
              <option value="HOSTEL">Hostel</option>
              <option value="CAMPUS_RULES">Campus Rules</option>
              <option value="CLUBS">Clubs</option>
              <option value="EVENTS">Events</option>
              <option value="GENERAL">General</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Document File (PDF, DOCX, TXT - Max 10MB)
            </label>
            <input
              type="file"
              required
              accept=".pdf,.docx,.doc,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of document content..."
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
              isLoading={isUploading}
              icon={<UploadCloud className="h-4 w-4" />}
            >
              Upload & Vector Index
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
