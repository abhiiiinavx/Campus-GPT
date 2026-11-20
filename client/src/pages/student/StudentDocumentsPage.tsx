import { useEffect, useState } from "react";
import { documentService } from "../../services/document.service.js";
import { DocumentItem } from "../../types/index.js";
import { Badge } from "../../components/common/Badge.js";
import { Button } from "../../components/common/Button.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.js";
import { EmptyState } from "../../components/common/EmptyState.js";
import {
  FileText,
  Download,
  Sparkles,
  Search,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

export const StudentDocumentsPage = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const data = await documentService.listDocuments({
          search: search || undefined,
        });
        setDocuments(data);
      } catch (err) {
        console.error("Failed to load documents:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocs();
  }, [search]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Campus Documents & Knowledge Base
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Verified academic ordinances, placement handbooks, and policy
            manuals indexed for CampusIQ AI.
          </p>
        </div>

        <Link to="/student/ai">
          <Button
            variant="glow"
            size="md"
            icon={<Sparkles className="h-4 w-4" />}
          >
            Ask AI from Documents
          </Button>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or document topic..."
          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {isLoading ? (
        <LoadingSpinner message="Searching RAG document store..." />
      ) : documents.length === 0 ? (
        <EmptyState
          title="No Documents Found"
          description="There are currently no indexed documents matching your search term."
          icon={<FileText className="h-10 w-10 text-indigo-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm hover:border-indigo-500/50 hover:shadow-glow transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="primary" size="sm">
                    {doc.category}
                  </Badge>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> AI RAG Indexed
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-3">
                  {doc.description ||
                    "Official campus publication verified for student reference."}
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  <span>{doc.fileName}</span> •{" "}
                  <span>{formatFileSize(doc.fileSize)}</span>
                </div>

                <Link to="/student/ai">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Sparkles className="h-3.5 w-3.5" />}
                  >
                    Query Document
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
