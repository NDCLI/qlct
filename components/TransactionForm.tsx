"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Transaction } from "@/types";
import { useCreateTransaction, useUpdateTransaction, useCategories } from "@/lib/hooks";
import { uploadReceipt } from "@/lib/upload-receipt";

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Transaction | null;
}

const today = () => new Date().toISOString().split("T")[0];

type ScanState = "idle" | "scanning" | "success" | "error";

export default function TransactionForm({ open, onClose, editing }: Props) {
  const { data: session } = useSession();
  const { data: categories = [] } = useCategories();
  const create = useCreateTransaction();
  const update = useUpdateTransaction();

  const [form, setForm] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    category: "",
    note: "",
    date: today(),
  });

  // Receipt state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState(false);

  // Scan state
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scanMessage, setScanMessage] = useState("");
  const [scanResult, setScanResult] = useState<{
    amount: number | null;
    note: string | null;
    category: string | null;
    date: string | null;
    confidence: number;
  } | null>(null);

  const scanCameraRef = useRef<HTMLInputElement>(null);
  const scanGalleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setForm({
        type: editing.type,
        amount: String(editing.amount),
        category: editing.category,
        note: editing.note,
        date: editing.date,
      });
      setReceiptUrl(editing.receiptUrl ?? null);
      setReceiptPreview(editing.receiptUrl ?? null);
    } else {
      setForm({ type: "expense", amount: "", category: "", note: "", date: today() });
      setReceiptUrl(null);
      setReceiptPreview(null);
    }
    setReceiptFile(null);
    setUploadProgress(null);
    setScanState("idle");
    setScanResult(null);
    if (scanCameraRef.current) scanCameraRef.current.value = "";
    if (scanGalleryRef.current) scanGalleryRef.current.value = "";
  }, [editing, open]);

  if (!open) return null;

  const isPending = create.isPending || update.isPending;

  // --- Scan receipt ---
  async function handleScanFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    setReceiptPreview(URL.createObjectURL(file));
    setReceiptFile(file);
    setScanState("scanning");
    setScanMessage("Đang phân tích hóa đơn...");
    setScanResult(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/scan-receipt", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.error ?? "Lỗi server");

      setScanResult(data);

      if (data.confidence < 0.3 || !data.amount) {
        setScanState("error");
        setScanMessage("Không đọc được thông tin. Vui lòng nhập tay.");
        return;
      }

      // Auto-fill form
      setScanState("success");
      setScanMessage(
        `Đọc thành công! Độ tin cậy: ${Math.round(data.confidence * 100)}%`
      );

      setForm((f) => ({
        ...f,
        amount: data.amount ? String(data.amount) : f.amount,
        note: data.note ?? f.note,
        date: data.date ?? f.date,
        category: data.category
          ? matchCategory(data.category, categories as { name: string }[])
          : f.category,
      }));
    } catch (err) {
      console.error(err);
      setScanState("error");
      setScanMessage("Lỗi kết nối. Thử lại sau.");
    }
  }

  function matchCategory(aiCategory: string, cats: { name: string }[]): string {
    // Try exact match first
    const exact = cats.find(
      (c) => c.name.toLowerCase() === aiCategory.toLowerCase()
    );
    if (exact) return exact.name;
    // Try partial match
    const partial = cats.find((c) =>
      aiCategory.toLowerCase().includes(c.name.toLowerCase()) ||
      c.name.toLowerCase().includes(aiCategory.toLowerCase())
    );
    return partial?.name ?? "";
  }

  function removeReceipt() {
    setReceiptFile(null);
    setReceiptPreview(null);
    setReceiptUrl(null);
    setScanState("idle");
    setScanResult(null);
    if (scanCameraRef.current) scanCameraRef.current.value = "";
    if (scanGalleryRef.current) scanGalleryRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(form.amount.replace(/,/g, ""));
    if (!amount || !form.category) return;

    // Lưu giao dịch ngay — không chờ upload ảnh
    const payload = { ...form, amount, receiptUrl: receiptUrl ?? undefined };

    let savedId: string | undefined;
    if (editing) {
      await update.mutateAsync({ id: editing.id, data: payload });
      savedId = editing.id;
    } else {
      const result = await create.mutateAsync(payload);
      savedId = result.id;
    }

    onClose();

    // Upload ảnh chạy nền sau khi đã đóng form
    if (receiptFile && session?.user?.id && savedId) {
      try {
        setUploadProgress(0);
        const uploadedUrl = await uploadReceipt(
          receiptFile,
          session.user.id,
          (pct) => setUploadProgress(pct)
        );
        // Patch receiptUrl vào transaction vừa tạo
        await fetch(`/api/transactions/${savedId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiptUrl: uploadedUrl }),
        });
      } catch {
        // Upload thất bại — giao dịch vẫn đã lưu, chỉ thiếu ảnh
        console.warn("Upload ảnh thất bại, giao dịch đã lưu không có ảnh.");
      } finally {
        setUploadProgress(null);
      }
    }
  }

  const filteredCategories = categories.filter((c: { type?: string }) =>
    !c.type || c.type === form.type
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editing ? "Chỉnh sửa giao dịch" : "Thêm giao dịch"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
          </div>

          {/* ===== SCAN RECEIPT ===== */}
          {!editing && (
            <div className="space-y-2">
              {/* Trạng thái idle: 2 nút chụp / quét AI */}
              {scanState === "idle" && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => scanCameraRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl font-semibold text-sm bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900 active:scale-[0.97] transition-all"
                  >
                    <span className="text-2xl">📷</span>
                    <span>Chụp hóa đơn</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scanGalleryRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl font-semibold text-sm border-2 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/30 active:scale-[0.97] transition-all"
                  >
                    <span className="text-2xl">✨</span>
                    <span>Quét bằng AI</span>
                  </button>
                </div>
              )}

              {/* Đang scan / đã có kết quả: nút full-width */}
              {scanState !== "idle" && (
                <button
                  type="button"
                  onClick={() => scanCameraRef.current?.click()}
                  disabled={scanState === "scanning"}
                  className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-sm transition-all border-2 ${
                    scanState === "scanning"
                      ? "bg-violet-50 dark:bg-violet-950/30 border-violet-300 dark:border-violet-700 text-violet-500 cursor-wait"
                      : scanState === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 text-emerald-700 dark:text-emerald-400"
                      : "bg-red-50 dark:bg-red-950/30 border-red-300 text-red-500 border-dashed"
                  }`}
                >
                  {scanState === "scanning" ? (
                    <>
                      <span className="inline-block w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                      Đang phân tích...
                    </>
                  ) : scanState === "success" ? (
                    <>✅ Quét thành công — chụp lại</>
                  ) : (
                    <>⚠️ Thử quét lại</>
                  )}
                </button>
              )}

              {/* Scan status message */}
              {scanState !== "idle" && (
                <div
                  className={`text-xs text-center px-3 py-2 rounded-xl ${
                    scanState === "scanning"
                      ? "bg-violet-50 dark:bg-violet-950/20 text-violet-600"
                      : scanState === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700"
                      : "bg-red-50 dark:bg-red-950/20 text-red-600"
                  }`}
                >
                  {scanMessage}
                </div>
              )}

              {/* Preview sau khi scan */}
              {receiptPreview && scanState !== "idle" && (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div
                    className="relative w-full h-32 cursor-pointer"
                    onClick={() => setLightbox(true)}
                  >
                    <Image
                      src={receiptPreview}
                      alt="Hóa đơn"
                      fill
                      className="object-contain bg-gray-50 dark:bg-gray-800"
                    />
                    {scanState === "scanning" && (
                      <div className="absolute inset-0 bg-violet-500/10 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-violet-400/60 animate-bounce" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={removeReceipt}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Camera input (mở camera trực tiếp trên mobile) */}
              <input
                ref={scanCameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleScanFile}
              />
              {/* Gallery input (chọn từ thư viện) */}
              <input
                ref={scanGalleryRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleScanFile}
              />
            </div>
          )}

          {/* Divider */}
          {!editing && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
              <span className="text-xs text-gray-400">hoặc nhập tay</span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
            </div>
          )}

          {/* Income / Expense toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: t, category: "" }))}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  form.type === t
                    ? t === "expense"
                      ? "bg-red-500 text-white"
                      : "bg-emerald-500 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-500"
                }`}
              >
                {t === "expense" ? "Chi tiêu" : "Thu nhập"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Số tiền (VNĐ)
                {scanState === "success" && scanResult?.amount && (
                  <span className="ml-2 text-xs text-emerald-600 font-normal">✨ AI điền</span>
                )}
              </label>
              <input
                type="number"
                required
                min={1}
                placeholder="100,000"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className={`w-full border rounded-xl px-4 py-3 text-lg font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  scanState === "success" && scanResult?.amount
                    ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Danh mục
                {scanState === "success" && scanResult?.category && (
                  <span className="ml-2 text-xs text-emerald-600 font-normal">✨ AI điền</span>
                )}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {filteredCategories.map((cat: { id: string; icon: string; name: string; color: string }) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, category: cat.name }))}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs transition-all ${
                      form.category === cat.name
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="leading-tight text-center">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ghi chú
                {scanState === "success" && scanResult?.note && (
                  <span className="ml-2 text-xs text-emerald-600 font-normal">✨ AI điền</span>
                )}
              </label>
              <input
                type="text"
                placeholder="Mô tả ngắn (tuỳ chọn)"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                className={`w-full border rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  scanState === "success" && scanResult?.note
                    ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ngày
                {scanState === "success" && scanResult?.date && (
                  <span className="ml-2 text-xs text-emerald-600 font-normal">✨ AI điền</span>
                )}
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className={`w-full border rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  scanState === "success" && scanResult?.date
                    ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !form.category || !form.amount}
              className="w-full py-3.5 rounded-xl font-semibold text-white transition-all disabled:opacity-50 bg-violet-600 hover:bg-violet-700 active:scale-95"
            >
              {isPending
                ? "Đang lưu..."
                : editing
                ? "Cập nhật"
                : "Thêm giao dịch"}
            </button>
          </form>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && receiptPreview && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button className="absolute top-4 right-4 text-white text-3xl leading-none" onClick={() => setLightbox(false)}>
            ✕
          </button>
          <div className="relative max-w-full max-h-full w-full h-full">
            <Image src={receiptPreview} alt="Hóa đơn" fill className="object-contain" />
          </div>
        </div>
      )}
    </>
  );
}
