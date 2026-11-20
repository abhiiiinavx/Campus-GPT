import { Link } from "react-router-dom";
import { Button } from "../components/common/Button.js";
import { GraduationCap, ArrowLeft } from "lucide-react";

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 mb-4">
        <GraduationCap className="h-10 w-10" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
        404 - Page Not Found
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
        The requested campus module does not exist or has been relocated.
      </p>
      <Link to="/">
        <Button
          variant="glow"
          size="md"
          icon={<ArrowLeft className="h-4 w-4" />}
        >
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};
