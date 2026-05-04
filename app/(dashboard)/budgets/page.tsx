"use client";
import { useState } from "react";
import { useBudgets, useUpsertBudget, useCategories } from "@/lib/hooks";
import { currentMonth, monthLabel, formatVND } from "@/lib/utils";
import BudgetProgressBar from "@/components/BudgetProgressBar";

function getPrevMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

export default function BudgetsPage() {
  const [month, setMonth] = useState(currentMonth());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ category: "", limit: "" });

  const { data: budgets = [], isLoading } = useBudgets(month);
  const { data: categories = [] } = useCategories();
  const upsert = useUpsertBudget();

  const expenseCategories = categories.filter(
    (c: { name: string }) => !["Lương", "Thu nhập khác"].includes(c.name)
  );

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const limit = parseFloat(formData.limit.replace(/,/g, ""));
    if (!formData.category || !limit) return;
    await upsert.mutateAsync({ category: formData.category, limit, month });
    setFormData({ category: "", limit: "" });
    setShowForm(false);
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
          onClick={() => setShowForm(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
        >
          + Đặt ngân sách
        </button>
      </div>

      {/* Summary */}
      {budgets.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-500">Tổng đã chi</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatVND(totalSpent)} / {formatVND(totalLimit)}
            </span>
          </div>
          <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                totalSpent / totalLimit >= 1
                  ? "bg-red-500"
                  : totalSpent / totalLimit >= 0.8
                  ? "bg-amber-400"
                  : "bg-violet-500"
              }`}
              style={{ width: `${Math.min(100, (totalSpent / totalLimit) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Budget list */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🎯</div>
          <p className="text-sm">Chưa có ngân sách nào cho tháng này</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-violet-600 text-sm font-medium hover:underline"
          >
            Tạo ngân sách đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const cat = categories.find((c: { name: string }) => c.name === budget.category);
            return (
              <div
                key={budget.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700"
              >
                <BudgetProgressBar
                  category={budget.category}
                  icon={cat?.icon}
                  limit={budget.limit}
                  spent={budget.spent}
                  percentage={budget.percentage}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Set budget modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Đặt ngân sách</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Danh mục</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData((f) => ({ ...f, category: e.target.value }))}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Chọn danh mục...</option>
                  {expenseCategories.map((c: { id: string; icon: string; name: string }) => (
                    <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hạn mức (VNĐ)</label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="2,000,000"
                  value={formData.limit}
                  onChange={(e) => setFormData((f) => ({ ...f, limit: e.target.value }))}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-lg font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <button
                type="submit"
                disabled={upsert.isPending}
                className="w-full py-3.5 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 transition-all active:scale-95"
              >
                {upsert.isPending ? "Đang lưu..." : "Lưu ngân sách"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
