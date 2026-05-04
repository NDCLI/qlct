"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";

const links = [
  { href: "/", label: "Tổng quan", icon: "◉" },
  { href: "/transactions", label: "Giao dịch", icon: "↕" },
  { href: "/budgets", label: "Ngân sách", icon: "◎" },
  { href: "/categories", label: "Danh mục", icon: "🏷️" },
  { href: "/reports", label: "Báo cáo", icon: "≡" },
];

export default function NavBar({ user }: { user: { name?: string | null; email?: string | null; image?: string | null } }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop top bar */}
      <header className="hidden sm:flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40">
        <div className="flex items-center gap-1">
          <span className="font-bold text-violet-600 text-lg mr-4">Chi Tiêu</span>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                pathname === l.href
                  ? "bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user.image && (
            <Image src={user.image} alt="avatar" width={32} height={32} className="rounded-full" />
          )}
          <span className="text-sm text-gray-600 dark:text-gray-400 hidden md:block">{user.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Mobile top mini bar */}
      <div className="sm:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <span className="font-bold text-violet-600">Chi Tiêu</span>
        {user.image && (
          <Image src={user.image} alt="avatar" width={28} height={28} className="rounded-full" />
        )}
      </div>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="grid grid-cols-5">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                pathname === l.href
                  ? "text-violet-600"
                  : "text-gray-400"
              }`}
            >
              <span className="text-lg leading-none">{l.icon}</span>
              <span>{l.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
