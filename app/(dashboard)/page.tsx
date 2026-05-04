"use client";
import { useState } from "react";
import { useTransactions } from "@/lib/hooks";
import { currentMonth, monthLabel, formatVND } from "@/lib/utils";
import StatsCard from "@/components/StatsCard";
import ExpensePieChart from "@/components/charts/ExpensePieChart";
import MonthlyBarChart from "@/components/charts/MonthlyBarChart";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";

function getPrevMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

export default function DashboardPage() {
  const [month, setMonth] = useState(currentMonth());
  const [showForm, setShowForm] = useState(false);

  const { data: transactions = [], isLoading } = useTransactions(month);
  const prevMonth = getPrevMonth(month);
  const { data: prevTxs = [] } = useTransactions(prevMonth);

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const prevExpense = prevTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const expenseTrend = prevExpense > 0 ? Math.round(((totalExpense - prevExpense) / prevExpense) * 100) : undefined;

  // Build last 6 months bar data
  const barData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = d.toISOString().slice(0, 7);
    return { month: `Th${d.getMonth() + 1}`, income: 0, expense: 0, _key: m };
  });
  // Only current month's transactions are loaded; bar chart is illustrative with real data for current month
  const curBarIdx = barData.findIndex((b) => b._key === month);
  if (curBarIdx >= 0) {
    barData[curBarIdx].income = totalIncome;
    barData[curBarIdx].expense = totalExpense;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Month picker */}
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
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          + Thêm
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatsCard title="Thu nhập" amount={totalIncome} type="income" />
        <StatsCard title="Chi tiêu" amount={totalExpense} type="expense" trend={expenseTrend} />
        <StatsCard title="Số dư" amount={balance} type="balance" />
      </div>

      {/* Monthly bar chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">So sánh 6 tháng</h3>
        <MonthlyBarChart data={barData} />
      </div>

      {/* Pie chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Chi tiêu theo danh mục</h3>
        <ExpensePieChart transactions={transactions} />
      </div>

      {/* Recent transactions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Giao dịch gần đây</h3>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <TransactionList month={month} />
        )}
      </div>

      <TransactionForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
