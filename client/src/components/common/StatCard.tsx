import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  badge?: ReactNode;
  glowColor?: "indigo" | "emerald" | "amber" | "rose";
  onClick?: () => void;
}

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  badge,
  glowColor = "indigo",
  onClick,
}: StatCardProps) => {
  const glowStyles = {
    indigo: "hover:border-indigo-500/50 hover:shadow-indigo-500/10",
    emerald: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
    amber: "hover:border-amber-500/50 hover:shadow-amber-500/10",
    rose: "hover:border-rose-500/50 hover:shadow-rose-500/10",
  };

  const iconBgStyles = {
    indigo:
      "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
    emerald:
      "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    amber:
      "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    rose: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm transition-all duration-200 ${glowStyles[glowColor]} ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${iconBgStyles[glowColor]}`}>
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </span>
        {badge}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{subtitle}</span>
        {trend && (
          <span
            className={`font-semibold ${
              trend.isPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}
          </span>
        )}
      </div>
    </motion.div>
  );
};
