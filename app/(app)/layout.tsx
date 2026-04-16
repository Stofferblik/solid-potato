import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/nav/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sessie = await auth();
  if (!sessie) redirect("/login");

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
