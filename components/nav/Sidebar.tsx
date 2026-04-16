"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  List,
  CalendarDays,
  Target,
  Users,
  LogOut,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navigatieItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/backlog", label: "Backlog", icon: List },
  { href: "/sprints", label: "Sprints", icon: CalendarDays },
  { href: "/strategie", label: "Strategie", icon: Target },
  { href: "/stakeholders", label: "Stakeholders", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
          <Layers className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none">PO App</p>
          <p className="text-xs text-muted-foreground">Product Owner</p>
        </div>
      </div>

      {/* Navigatie */}
      <nav className="flex-1 space-y-1 p-3">
        {navigatieItems.map(({ href, label, icon: Icon }) => {
          const actief = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                actief
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Uitloggen */}
      <div className="border-t p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Uitloggen
        </button>
      </div>
    </aside>
  );
}
