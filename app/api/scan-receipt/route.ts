import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAuthUser } from "@/lib/api-helpers";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export async function POST(req: NextRequest) {
  const { error } = await getAuthUser();
  if (error) return error;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Không có file" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = buffer.toString("base64");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `Bạn là trợ lý đọc hóa đơn. Phân tích ảnh hóa đơn này và trả về JSON với các trường sau:
- amount: số tiền tổng cộng (chỉ số, không đơn vị, ví dụ: 150000)
- note: mô tả ngắn gọn hóa đơn mua gì (tiếng Việt, tối đa 60 ký tự)
- category: danh mục phù hợp nhất trong danh sách: Ăn uống, Mua sắm, Di chuyển, Giải trí, Sức khỏe, Giáo dục, Hóa đơn, Khác
- date: ngày trên hóa đơn định dạng YYYY-MM-DD (nếu không rõ để null)
- confidence: độ tin cậy từ 0 đến 1

Ví dụ output:
{"amount": 85000, "note": "Cà phê và bánh mì tại The Coffee House", "category": "Ăn uống", "date": "2025-05-04", "confidence": 0.95}

Nếu không phải hóa đơn hoặc không đọc được, trả về:
{"amount": null, "note": null, "category": null, "date": null, "confidence": 0}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: file.type || "image/jpeg",
        },
      },
    ]);

    const text = result.response.text();
    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (err) {
    console.error("POST /api/scan-receipt error:", err);
    return NextResponse.json({ error: "Không đọc được hóa đơn" }, { status: 500 });
  }
}
