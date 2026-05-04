"use client";
import { useState } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/lib/hooks";

const PRESET_ICONS = [
  "🍔","🍜","🍕","☕","🛒","🎮","🎬","✈️","🏠","🚗","💊","📚",
  "👕","💰","🎁","⚡","💧","📱","💻","🏋️","🎵","🐾","💄","🔧",
];

const PRESET_COLORS = [
  "#ef4444","#f97316","#eab308","#22c55e","#14b8a6","#3b82f6",
  "#8b5cf6","#ec4899","#64748b","#0ea5e9","#84cc16","#f59e0b",
];

interface CategoryForm { name: string; icon: string; color: string; }

const emptyForm: CategoryForm = { name: "", icon: "🍔", color: "#8b5cf6" };

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const del = useDeleteCategory();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<{ id: string } & CategoryForm | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(cat: { id: string; name: string; icon: string; color: string }) {
    setEditing({ id: cat.id, name: cat.name, icon: cat.icon, color: cat.color });
    setForm({ name: cat.name, icon: cat.icon, color: cat.color });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editing) {
      await update.mutateAsync({ id: editing.id, data: form });
    } else {
      await create.mutateAsync(form);
    }
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  }

  async function handleDelete(id: string) {
    await del.mutateAsync(id);
    setDeleteConfirm(null);
  }

  const isPending = create.isPending || update.isPending;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Danh mục</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Quản lý danh mục chi tiêu và thu nhập</p>
        </div>
        <button
          id="btn-add-category"
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
        >
          <span className="text-lg leading-none">+</span> Thêm danh mục
        </button>
      </div>

      {/* Category list */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-600">
          <span className="text-5xl mb-3">🗂️</span>
          <p className="font-medium">Chưa có danh mục nào</p>
          <p className="text-sm mt-1">Nhấn &quot;Thêm danh mục&quot; để bắt đầu</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(categories as { id: string; name: string; icon: string; color: string }[]).map((cat) => (
            <div
              key={cat.id}
              className="group relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 bg-white dark:bg-gray-900 transition-all hover:shadow-md"
              style={{ borderColor: cat.color + "44" }}
            >
              {/* Color dot */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                style={{ backgroundColor: cat.color + "22" }}
              >
                {cat.icon}
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 text-center leading-tight">{cat.name}</span>
              <div
                className="w-2 h-2 rounded-full absolute top-3 right-3"
                style={{ backgroundColor: cat.color }}
              />

              {/* Actions (hover) */}
              <div className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  id={`btn-edit-cat-${cat.id}`}
                  onClick={() => openEdit(cat)}
                  className="px-3 py-1.5 bg-white text-gray-800 text-xs font-semibold rounded-lg hover:bg-gray-100"
                >
                  ✏️ Sửa
                </button>
                <button
                  id={`btn-del-cat-${cat.id}`}
                  onClick={() => setDeleteConfirm(cat.id)}
                  className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600"
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editing ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên danh mục</label>
                <input
                  id="input-cat-name"
                  type="text"
                  required
                  placeholder="VD: Ăn uống, Giải trí..."
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Icon picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon <span className="text-2xl ml-2">{form.icon}</span>
                </label>
                <div className="grid grid-cols-8 gap-1.5">
                  {PRESET_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, icon }))}
                      className={`text-xl p-1.5 rounded-lg transition-all ${
                        form.icon === icon
                          ? "bg-violet-100 dark:bg-violet-950 ring-2 ring-violet-500"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Màu sắc</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, color }))}
                      className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                        form.color === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: form.color + "22" }}
                >
                  {form.icon}
                </div>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {form.name || "Tên danh mục..."}
                </span>
                <div className="ml-auto w-2.5 h-2.5 rounded-full" style={{ backgroundColor: form.color }} />
              </div>

              <button
                id="btn-submit-category"
                type="submit"
                disabled={isPending || !form.name.trim()}
                className="w-full py-3.5 rounded-xl font-semibold text-white transition-all disabled:opacity-50 bg-violet-600 hover:bg-violet-700 active:scale-95"
              >
                {isPending ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm danh mục"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-80 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Xác nhận xóa</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Xóa danh mục này? Các giao dịch liên quan sẽ không bị xóa.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Hủy
              </button>
              <button
                id="btn-confirm-delete"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={del.isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                {del.isPending ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
