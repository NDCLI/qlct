"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Transaction, Budget } from "@/types";

const API = {
  async getTransactions(month?: string, category?: string) {
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    if (category) params.set("category", category);
    const res = await fetch(`/api/transactions?${params}`);
    if (!res.ok) throw new Error("Lỗi tải danh sách giao dịch");
    return res.json() as Promise<Transaction[]>;
  },

  async createTransaction(data: Omit<Transaction, "id" | "userId" | "createdAt">) {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Lỗi thêm giao dịch");
    return res.json() as Promise<Transaction>;
  },

  async updateTransaction(id: string, data: Partial<Transaction>) {
    const res = await fetch(`/api/transactions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Lỗi cập nhật giao dịch");
    return res.json() as Promise<Transaction>;
  },

  async deleteTransaction(id: string) {
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Lỗi xóa giao dịch");
    return res.json();
  },

  async getBudgets(month?: string) {
    const params = month ? `?month=${month}` : "";
    const res = await fetch(`/api/budgets${params}`);
    if (!res.ok) throw new Error("Lỗi tải ngân sách");
    return res.json() as Promise<(Budget & { spent: number; percentage: number })[]>;
  },

  async upsertBudget(data: { category: string; limit: number; month: string }) {
    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Lỗi lưu ngân sách");
    return res.json();
  },

  async getCategories() {
    const res = await fetch("/api/categories");
    if (!res.ok) throw new Error("Lỗi tải danh mục");
    return res.json();
  },

  async createCategory(data: { name: string; icon: string; color: string }) {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Lỗi thêm danh mục");
    return res.json();
  },

  async updateCategory(id: string, data: { name: string; icon: string; color: string }) {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Lỗi cập nhật danh mục");
    return res.json();
  },

  async deleteCategory(id: string) {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Lỗi xóa danh mục");
    return res.json();
  },
};

export function useTransactions(month?: string, category?: string) {
  return useQuery({
    queryKey: ["transactions", month, category],
    queryFn: () => API.getTransactions(month, category),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: API.createTransaction,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Transaction> }) =>
      API.updateTransaction(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: API.deleteTransaction,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useBudgets(month?: string) {
  return useQuery({
    queryKey: ["budgets", month],
    queryFn: () => API.getBudgets(month),
  });
}

export function useUpsertBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: API.upsertBudget,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

export function useCategories() {
  return useQuery({ queryKey: ["categories"], queryFn: API.getCategories });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: API.createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; icon: string; color: string } }) =>
      API.updateCategory(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: API.deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}
