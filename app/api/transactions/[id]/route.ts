import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getAuthUser } from "@/lib/api-helpers";

// PUT /api/transactions/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await getAuthUser();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await req.json();
    const { amount, type, category, note, date, receiptUrl } = body;

    if (amount !== undefined && (typeof amount !== "number" || amount <= 0)) {
      return NextResponse.json({ error: "amount phải là số dương" }, { status: 400 });
    }

    const docRef = adminDb
      .collection("users")
      .doc(user!.id)
      .collection("transactions")
      .doc(id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Không tìm thấy giao dịch" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (amount !== undefined) updateData.amount = amount;
    if (type !== undefined) updateData.type = type;
    if (category !== undefined) updateData.category = category;
    if (note !== undefined) updateData.note = note;
    if (date !== undefined) updateData.date = date;
    if (receiptUrl !== undefined) updateData.receiptUrl = receiptUrl;
    updateData.updatedAt = new Date().toISOString();

    await docRef.update(updateData);

    return NextResponse.json({ id, ...doc.data(), ...updateData });
  } catch (err) {
    console.error("PUT /api/transactions/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/transactions/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await getAuthUser();
  if (error) return error;

  const { id } = await params;

  try {
    const docRef = adminDb
      .collection("users")
      .doc(user!.id)
      .collection("transactions")
      .doc(id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Không tìm thấy giao dịch" }, { status: 404 });
    }

    await docRef.delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/transactions/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
