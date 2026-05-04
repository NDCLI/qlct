export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  note: string;
  date: string; // ISO string "YYYY-MM-DD"
  createdAt: string;
  userId: string;
  receiptUrl?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  month: string; // "YYYY-MM"
  userId: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  userId: string;
}

export interface MonthlyStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: Record<string, number>;
}

// NextAuth session extension
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
