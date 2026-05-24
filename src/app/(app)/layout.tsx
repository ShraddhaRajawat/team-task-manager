import Link from "next/link";
import { LayoutDashboard, ListTodo, Users } from "lucide-react";

import { SignOutButton } from "@/components/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { requireSession } from "@/lib/authz";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: Users },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <div className="min-h-full bg-gradient-to-br from-zinc-50 via-white to-zinc-100 text-zinc-900 dark:from-black dark:via-zinc-950 dark:to-black dark:text-zinc-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl">
        <aside className="hidden w-64 flex-col gap-2 border-r border-zinc-200/80 bg-white/80 px-4 py-6 backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/70 md:flex">
          <div className="px-2">
            <div className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              Workspace
            </div>
            <div className="mt-2 text-sm font-semibold tracking-tight">Team Task Manager</div>
            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{session.user.email}</div>
          </div>

          <nav className="mt-6 flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:shadow-sm dark:text-zinc-200 dark:hover:bg-zinc-900"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto px-2 pt-4 border-t border-zinc-100 dark:border-zinc-900">
            <div className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 dark:text-zinc-500">
              Developed By
            </div>
            <div className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Shraddha
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-zinc-200/80 bg-white/80 px-4 py-3 backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/70 md:px-6">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{session.user.name}</div>
              <div className="truncate text-xs text-zinc-500 capitalize dark:text-zinc-400">{session.user.role}</div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <SignOutButton />
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

