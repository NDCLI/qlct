"use client";
import { useState } from "react";
import Image from "next/image";
import { Transaction } from "@/types";
import { useTransactions, useDeleteTransaction } from "@/lib/hooks";
import { formatVND, formatDate } from "@/lib/utils";
import TransactionForm from "./TransactionForm";

interface Props {
  month: string;
}

export default function TransactionList({ month }: Props) {
  const { data: transactions = [], isLoading } = useTransactions(month);
  const deleteTx = useDeleteTransaction();
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [receiptLightbox, setReceiptLightbox] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="text-5xl mb-3">📭</div>
        <p className="text-sm">Chưa có giao dịch nào trong tháng này</p>
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, Transaction[]> = {};
  for (const tx of transactions) {
    if (!grouped[tx.date]) grouped[tx.date] = [];
    grouped[tx.date].push(tx);
  }

  return (
    <>
      <div className="space-y-6">
        {Object.entries(grouped)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([date, txs]) => {
            const dayTotal = txs.reduce(
              (acc, tx) => acc + (tx.type === "income" ? tx.amount : -tx.amount),
              0
            );
            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {formatDate(date)}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      dayTotal >= 0 ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {dayTotal >= 0 ? "+" : ""}
                    {formatVND(dayTotal)}
                  </span>
                </div>

                <div className="space-y-2">
                  {txs.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-100 dark:border-gray-700 group"
                    >
                      <div className="text-2xl w-10 text-center flex-shrink-0">
                        {/* Icon sẽ map từ category — tạm dùng emoji mặc định */}
                        {tx.type === "income" ? "💰" : "💸"}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {tx.note || tx.category}
                        </div>
                        <div className="text-xs text-gray-400">{tx.category}</div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div
                          className={`font-semibold text-sm ${
                            tx.type === "income" ? "text-emerald-600" : "text-red-500"
                          }`}
                        >
                          {tx.type === "income" ? "+" : "-"}
                          {formatVND(tx.amount)}
                        </div>
                        {tx.receiptUrl && (
                          <button
                            onClick={() => setReceiptLightbox(tx.receiptUrl!)}
                            className="text-xs text-violet-500 hover:text-violet-700 mt-0.5 flex items-center gap-0.5 ml-auto"
                            title="Xem hóa đơn"
                          >
                            🧾 <span>HĐ</span>
                          </button>
                        )}
                      </div>

                      {/* Actions — hiện khi hover */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditing(tx)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Xóa giao dịch này?")) deleteTx.mutate(tx.id);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>

      <TransactionForm open={!!editing} onClose={() => setEditing(null)} editing={editing} />

      {/* Receipt lightbox */}
      {receiptLightbox && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setReceiptLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl leading-none"
            onClick={() => setReceiptLightbox(null)}
          >
            ✕
          </button>
          <div className="relative w-full max-w-lg h-[80vh]">
            <Image
              src={receiptLightbox}
              alt="Hóa đơn"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
