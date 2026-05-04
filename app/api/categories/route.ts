import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getAuthUser } from "@/lib/api-helpers";

// GET /api/categories
export async function GET() {
  const { user, error } = await getAuthUser();
  if (error) return error;

  try {
    const snap = await adminDb
      .collection("users")
      .doc(user!.id)
      .collection("categories")
      .orderBy("name")
      .get();

    const categories = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(categories);
  } catch (err) {
    console.error("GET /api/categories error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/categories
export async function POST(req: NextRequest) {
  const { user, error } = await getAuthUser();
  if (error) return error;

  try {
    const { name, icon, color } = await req.json();
    if (!name || !icon || !color) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    const newCat = { name, icon, color, userId: user!.id, createdAt: new Date().toISOString() };
    const docRef = await adminDb
      .collection("users")
      .doc(user!.id)
      .collection("categories")
      .add(newCat);

    return NextResponse.json({ id: docRef.id, ...newCat }, { status: 201 });
  } catch (err) {
    console.error("POST /api/categories error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
