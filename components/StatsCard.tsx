"use client";
import { formatVND } from "@/lib/utils";

interface Props {
  title: string;
  amount: number;
  type: "income" | "expense" | "balance";
  trend?: number; // % so với tháng trước
}

const config = {
  income: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", icon: "↑", border: "border-emerald-200 dark:border-emerald-800" },
  expense: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-600 dark:text-red-400", icon: "↓", border: "border-red-200 dark:border-red-800" },
  balance: { bg: "bg-violet-50 dark:bg-violet-950", text: "text-violet-700 dark:text-violet-300", icon: "≈", border: "border-violet-200 dark:border-violet-800" },
};

export default function StatsCard({ title, amount, type, trend }: Props) {
  const c = config[type];
  return (
    <div className={`rounded-2xl p-4 border ${c.bg} ${c.border}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
        <span className={`text-lg font-bold ${c.text}`}>{c.icon}</span>
      </div>
      <div className={`text-xl font-bold ${c.text}`}>{formatVND(amount)}</div>
      {trend !== undefined && (
        <div className={`text-xs mt-1 ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% so với tháng trước
        </div>
      )}
    </div>
  );
}
