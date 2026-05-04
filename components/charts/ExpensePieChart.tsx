"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Transaction } from "@/types";
import { formatVND } from "@/lib/utils";

const COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899","#14b8a6","#64748b","#a855f7"];

interface Props {
  transactions: Transaction[];
}

export default function ExpensePieChart({ transactions }: Props) {
  const expenses = transactions.filter((t) => t.type === "expense");

  const byCategory: Record<string, number> = {};
  for (const tx of expenses) {
    byCategory[tx.category] = (byCategory[tx.category] ?? 0) + tx.amount;
  }

  const data = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Chưa có dữ liệu chi tiêu
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatVND(value)}
          contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
        />
        <Legend
          formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
