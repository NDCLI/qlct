import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginButton from "@/components/LoginButton";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/");

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-10 w-full max-w-sm text-center space-y-6">
        <div>
          <div className="text-5xl mb-3">💸</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chi Tiêu</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Quản lý chi tiêu thông minh, đơn giản
          </p>
        </div>

        <div className="space-y-2 text-left text-sm text-gray-500 dark:text-gray-400">
          {["Theo dõi thu chi hàng ngày", "Đặt ngân sách theo danh mục", "Báo cáo trực quan"].map((f) => (
            <div key={f} className="flex items-center gap-2">
              <span className="text-violet-500">✓</span> {f}
            </div>
          ))}
        </div>

        <LoginButton />

        <p className="text-xs text-gray-400">
          Dữ liệu của bạn được lưu riêng tư, chỉ bạn mới xem được.
        </p>
      </div>
    </div>
  );
}
