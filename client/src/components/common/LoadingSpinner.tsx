interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export const LoadingSpinner = ({
  message = "Loading CampusIQ data...",
  size = "md",
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-16 h-16 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full border-indigo-200 dark:border-indigo-900 border-t-indigo-600 animate-spin`}
        />
        <div className="absolute inset-0 rounded-full blur-sm bg-indigo-500/20 animate-pulse" />
      </div>
      {message && (
        <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
          {message}
        </p>
      )}
    </div>
  );
};
