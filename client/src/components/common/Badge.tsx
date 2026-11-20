import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
  className?: string;
}

export const Badge = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
}: BadgeProps) => {
  const variantStyles = {
    primary:
      "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 border-indigo-500/30",
    success:
      "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500/30",
    warning:
      "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/30",
    danger:
      "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300 border-rose-500/30",
    info: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300 border-sky-500/30",
    neutral:
      "bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300 border-slate-500/30",
  };

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs font-medium px-2.5 py-1",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
