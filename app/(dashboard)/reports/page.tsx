"use client";
import { useState } from "react";
import { useTransactions, useCategories } from "@/lib/hooks";
import { currentMonth, monthLabel, formatVND, formatDate } from "@/lib/utils";
import ExpensePieChart from "@/components/charts/ExpensePieChart";

function getPrevMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

export default function ReportsPage() {
  const [month, setMonth] = useState(currentMonth());
  const { data: transactions = [], isLoading } = useTransactions(month);
  const { data: categories = [] } = useCategories();

  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  // Top 5 categories by spend
  const byCategory: Record<string, number> = {};
  for (const tx of transactions.filter((t) => t.type === "expense")) {
    byCategory[tx.category] = (byCategory[tx.category] ?? 0) + tx.amount;
  }
  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  function exportCSV() {
    const header = "Ngày,Loại,Danh mục,Ghi chú,Số tiền\n";
    const rows = transactions.map((tx) =>
      [
        formatDate(tx.date),
        tx.type === "income" ? "Thu nhập" : "Chi tiêu",
        tx.category,
        `"${tx.note.replace(/"/g, '""')}"`,
        tx.amount,
      ].join(",")
    );
    const csv = "\uFEFF" + header + rows.join("\n"); // BOM for Excel Vietnamese
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chi-tieu-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonth(getPrevMonth(month))}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            ‹
          </button>
          <span className="font-semibold text-gray-800 dark:text-white">{monthLabel(month)}</span>
          <button
            onClick={() => {
              const next = new Date(month + "-01");
              next.setMonth(next.getMonth() + 1);
              const nm = next.toISOString().slice(0, 7);
              if (nm <= currentMonth()) setMonth(nm);
            }}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            ›
          </button>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          ↓ Xuất CSV
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4">
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">Tổng thu</div>
          <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatVND(income)}</div>
        </div>
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl p-4">
          <div className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Tổng chi</div>
          <div className="text-lg font-bold text-red-600 dark:text-red-400">{formatVND(expense)}</div>
        </div>
      </div>

      {/* Pie chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phân bổ chi tiêu</h3>
        {isLoading ? (
          <div className="h-48 animate-pulse bg-gray-100 dark:bg-gray-700 rounded-xl" />
        ) : (
          <ExpensePieChart transactions={transactions} />
        )}
      </div>

      {/* Top categories */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Top danh mục chi tiêu</h3>
        {topCategories.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Chưa có dữ liệu</p>
        ) : (
          <div className="space-y-3">
            {topCategories.map(([cat, amount], i) => {
              const catInfo = categories.find((c: { name: string }) => c.name === cat);
              const pct = expense > 0 ? Math.round((amount / expense) * 100) : 0;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-lg w-8 text-center">{catInfo?.icon ?? "📦"}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-200">{cat}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatVND(amount)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <div
                        className="h-full rounded-full bg-violet-500"
                        style={{ width: `${pct}%`, opacity: 1 - i * 0.15 }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction count */}
      <div className="text-center text-sm text-gray-400">
        {transactions.length} giao dịch trong tháng này
      </div>
    </div>
  );
}
