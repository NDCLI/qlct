"use client";
import { formatVND } from "@/lib/utils";

interface Props {
  category: string;
  icon?: string;
  limit: number;
  spent: number;
  percentage: number;
}

export default function BudgetProgressBar({ category, icon, limit, spent, percentage }: Props) {
  const isWarning = percentage >= 80 && percentage < 100;
  const isOver = percentage >= 100;

  const barColor = isOver
    ? "bg-red-500"
    : isWarning
    ? "bg-amber-400"
    : "bg-violet-500";

  const textColor = isOver
    ? "text-red-600 dark:text-red-400"
    : isWarning
    ? "text-amber-600 dark:text-amber-400"
    : "text-gray-500 dark:text-gray-400";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{category}</span>
          {isOver && (
            <span className="text-xs bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
              Vượt ngân sách!
            </span>
          )}
          {isWarning && (
            <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
              Gần đến hạn mức
            </span>
          )}
        </div>
        <span className={`text-xs font-semibold ${textColor}`}>{percentage}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-400">
        <span>Đã chi: {formatVND(spent)}</span>
        <span>Hạn mức: {formatVND(limit)}</span>
      </div>
    </div>
  );
}
