import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import NavBar from "@/components/NavBar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <NavBar user={session.user} />
      <main className="pb-24 sm:pb-8 pt-4">{children}</main>
    </div>
  );
}
