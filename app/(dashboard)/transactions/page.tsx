"use client";
import { useState } from "react";
import { currentMonth, monthLabel } from "@/lib/utils";
import TransactionList from "@/components/TransactionList";
import TransactionForm from "@/components/TransactionForm";

function getPrevMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

export default function TransactionsPage() {
  const [month, setMonth] = useState(currentMonth());
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
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
          + Thêm
        </button>
      </div>

      <TransactionList month={month} />
      <TransactionForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
