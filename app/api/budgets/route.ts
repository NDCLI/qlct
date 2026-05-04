import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getAuthUser } from "@/lib/api-helpers";
import { Budget, Transaction } from "@/types";

// GET /api/budgets?month=2025-05
// Trả về budgets kèm spent (đã chi) trong tháng đó
export async function GET(req: NextRequest) {
  const { user, error } = await getAuthUser();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") ?? new Date().toISOString().slice(0, 7);

  try {
    const userRef = adminDb.collection("users").doc(user!.id);

    // Lấy budgets của tháng
    const budgetSnap = await userRef
      .collection("budgets")
      .where("month", "==", month)
      .get();

    const budgets: Budget[] = budgetSnap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Budget, "id">),
    }));

    // Lấy tổng chi theo từng danh mục trong tháng
    const txSnap = await userRef
      .collection("transactions")
      .where("type", "==", "expense")
      .where("date", ">=", `${month}-01`)
      .where("date", "<=", `${month}-31`)
      .get();

    const spentByCategory: Record<string, number> = {};
    txSnap.docs.forEach((doc) => {
      const tx = doc.data() as Transaction;
      spentByCategory[tx.category] = (spentByCategory[tx.category] ?? 0) + tx.amount;
    });

    // Gắn spent vào từng budget
    const result = budgets.map((b) => ({
      ...b,
      spent: spentByCategory[b.category] ?? 0,
      percentage: Math.min(100, Math.round(((spentByCategory[b.category] ?? 0) / b.limit) * 100)),
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/budgets error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/budgets
export async function POST(req: NextRequest) {
  const { user, error } = await getAuthUser();
  if (error) return error;

  try {
    const body = await req.json();
    const { category, limit, month } = body;

    if (!category || !limit || !month) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }
    if (typeof limit !== "number" || limit <= 0) {
      return NextResponse.json({ error: "limit phải là số dương" }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(user!.id);

    // Kiểm tra đã có budget cho category+month này chưa — nếu có thì update
    const existing = await userRef
      .collection("budgets")
      .where("category", "==", category)
      .where("month", "==", month)
      .limit(1)
      .get();

    if (!existing.empty) {
      await existing.docs[0].ref.update({ limit, updatedAt: new Date().toISOString() });
      return NextResponse.json({ id: existing.docs[0].id, category, limit, month });
    }

    const newBudget = { category, limit, month, userId: user!.id, createdAt: new Date().toISOString() };
    const docRef = await userRef.collection("budgets").add(newBudget);

    return NextResponse.json({ id: docRef.id, ...newBudget }, { status: 201 });
  } catch (err) {
    console.error("POST /api/budgets error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
