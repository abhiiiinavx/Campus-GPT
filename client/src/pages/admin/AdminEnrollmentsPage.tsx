import { useEffect, useState } from "react";
import { academicService } from "../../services/academic.service.js";
import { Enrollment, Subject } from "../../types/index.js";
import { Badge } from "../../components/common/Badge.js";
import { Button } from "../../components/common/Button.js";
import { Modal } from "../../components/common/Modal.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.js";
import { Trash2, Plus, Search, BookOpen, User } from "lucide-react";

export const AdminEnrollmentsPage = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchEnrollments = async () => {
    try {
      const [enrollData, studentData, subjectData] = await Promise.all([
        academicService.listEnrollments(),
        academicService.listStudents(),
        academicService.listSubjects(),
      ]);
      setEnrollments(enrollData || []);
      setStudents(studentData || []);
      setSubjects(subjectData?.items || []);

      if (studentData && studentData.length > 0) {
        setSelectedStudentId(studentData[0].id);
      }
      if (subjectData?.items && subjectData.items.length > 0) {
        setSelectedSubjectId(subjectData.items[0].id);
      }
    } catch (err) {
      console.error("Failed to load enrollments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedSubjectId) return;

    setIsSubmitting(true);
    setModalError(null);

    try {
      await academicService.enroll({
        studentId: selectedStudentId,
        subjectId: selectedSubjectId,
      });
      setIsModalOpen(false);
      await fetchEnrollments();
    } catch (err: any) {
      setModalError(
        err.response?.data?.message || "Failed to enroll student in subject.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this student enrollment?"))
      return;
    try {
      await academicService.deleteEnrollment(id);
      fetchEnrollments();
    } catch (err) {
      console.error("Failed to delete enrollment:", err);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading course enrollment mappings..." />;
  }

  const filteredEnrollments = enrollments.filter((enr) => {
    const sName = enr.student?.user?.fullName?.toLowerCase() || "";
    const sRoll = enr.student?.rollNumber?.toLowerCase() || "";
    const subCode = enr.subject?.code?.toLowerCase() || "";
    const subName = enr.subject?.name?.toLowerCase() || "";
    const q = search.toLowerCase();
    return (
      sName.includes(q) ||
      sRoll.includes(q) ||
      subCode.includes(q) ||
      subName.includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Course Enrollment Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Student registration mappings, subject capacity, and active enrollment records.
          </p>
        </div>

        <Button
          variant="glow"
          size="md"
          onClick={() => {
            setModalError(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="h-4 w-4" />}
        >
          Enroll Student
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by student name, roll number, or course code..."
          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="pb-3 px-4">Student Name</th>
                <th className="pb-3 px-4">Roll Number</th>
                <th className="pb-3 px-4">Subject Code</th>
                <th className="pb-3 px-4">Subject Name</th>
                <th className="pb-3 px-4">Credits</th>
                <th className="pb-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredEnrollments.map((enr) => (
                <tr
                  key={enr.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {enr.student?.user?.fullName || "Student"}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-500">
                    {enr.student?.rollNumber}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                    {enr.subject?.code}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    {enr.subject?.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {enr.subject?.credits}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleDelete(enr.id)}
                      className="text-rose-500 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Remove Enrollment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enroll Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Enroll Student in Subject"
      >
        <form onSubmit={handleEnroll} className="space-y-4">
          {modalError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Student
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.user?.fullName} ({st.rollNumber}) - {st.department?.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Course / Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name} ({sub.credits} Credits)
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="glow"
              size="sm"
              isLoading={isSubmitting}
            >
              Confirm Enrollment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
