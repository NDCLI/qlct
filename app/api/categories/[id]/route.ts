import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getAuthUser } from "@/lib/api-helpers";

// PUT /api/categories/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await getAuthUser();
  if (error) return error;

  const { id } = await params;

  try {
    const { name, icon, color } = await req.json();
    if (!name || !icon || !color) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    const ref = adminDb
      .collection("users")
      .doc(user!.id)
      .collection("categories")
      .doc(id);

    await ref.update({ name, icon, color });
    const doc = await ref.get();
    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("PUT /api/categories/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/categories/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await getAuthUser();
  if (error) return error;

  const { id } = await params;

  try {
    await adminDb
      .collection("users")
      .doc(user!.id)
      .collection("categories")
      .doc(id)
      .delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/categories/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
