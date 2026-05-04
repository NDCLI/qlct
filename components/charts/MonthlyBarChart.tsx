"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { formatVND } from "@/lib/utils";

interface MonthData {
  month: string; // "Th5"
  income: number;
  expense: number;
}

interface Props {
  data: MonthData[];
}

export default function MonthlyBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis
          tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            formatVND(value),
            name === "income" ? "Thu nhập" : "Chi tiêu",
          ]}
          contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
        />
        <Legend formatter={(v) => (v === "income" ? "Thu nhập" : "Chi tiêu")} />
        <Bar dataKey="income" fill="#22c55e" radius={[6, 6, 0, 0]} />
        <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
