import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getAuthUser } from "@/lib/api-helpers";
import { Transaction } from "@/types";

// GET /api/transactions?month=2025-05&category=Ăn uống
export async function GET(req: NextRequest) {
  const { user, error } = await getAuthUser();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // "YYYY-MM"
  const category = searchParams.get("category");

  try {
    let query = adminDb
      .collection("users")
      .doc(user!.id)
      .collection("transactions")
      .orderBy("date", "desc") as FirebaseFirestore.Query;

    // Lọc theo tháng: date bắt đầu từ "YYYY-MM-01" đến "YYYY-MM-31"
    if (month) {
      query = query
        .where("date", ">=", `${month}-01`)
        .where("date", "<=", `${month}-31`);
    }

    if (category) {
      query = query.where("category", "==", category);
    }

    const snapshot = await query.limit(200).get();
    const transactions: Transaction[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Transaction, "id">),
    }));

    return NextResponse.json(transactions);
  } catch (err) {
    console.error("GET /api/transactions error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/transactions
export async function POST(req: NextRequest) {
  const { user, error } = await getAuthUser();
  if (error) return error;

  try {
    const body = await req.json();
    const { amount, type, category, note, date, receiptUrl } = body;

    // Validate
    if (!amount || !type || !category || !date) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }
    if (!["income", "expense"].includes(type)) {
      return NextResponse.json({ error: "type không hợp lệ" }, { status: 400 });
    }
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "amount phải là số dương" }, { status: 400 });
    }

    const newTransaction = {
      amount,
      type,
      category,
      note: note ?? "",
      date,
      receiptUrl: receiptUrl ?? null,
      userId: user!.id,
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb
      .collection("users")
      .doc(user!.id)
      .collection("transactions")
      .add(newTransaction);

    return NextResponse.json({ id: docRef.id, ...newTransaction }, { status: 201 });
  } catch (err) {
    console.error("POST /api/transactions error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
