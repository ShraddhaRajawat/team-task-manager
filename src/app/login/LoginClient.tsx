"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";

import { ThemeToggle } from "@/components/ThemeToggle";

export function LoginClient({
  variant,
}: {
  variant: "admin" | "member";
}) {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (email !== normalizedEmail) {
      toast("Email should be lowercase (example: name@gmail.com). We fixed it for you.", { duration: 4000 });
      setEmail(normalizedEmail);
    }
    setLoading(true);
    const res = await signIn("credentials", { email: normalizedEmail, password, redirect: false });
    setLoading(false);

    if (!res?.ok) {
      const existsRes = await fetch(`/api/auth/exists?email=${encodeURIComponent(normalizedEmail)}`, {
        cache: "no-store",
      });
      const existsData = (await existsRes.json().catch(() => null)) as { exists?: boolean } | null;
      if (existsRes.ok && existsData?.exists === false) {
        toast.error("No account found with this email. Please create an account.");
        return;
      }
      toast.error("Invalid email or password");
      return;
    }

    const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
    const session = (await sessionRes.json().catch(() => null)) as { user?: { role?: string } } | null;
    const role = session?.user?.role;

    if (variant === "admin" && role !== "admin") {
      toast.error("This is Admin login. Please use Member login.");
      await signOut({ redirect: false });
      return;
    }
    if (variant === "member" && role !== "member") {
      toast.error("This is Member login. Please use Admin login.");
      await signOut({ redirect: false });
      return;
    }

    router.push(next);
  }

  return (
    <div className="fancy-page-bg flex min-h-screen items-center justify-center bg-zinc-50 px-4 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="fancy-card w-full max-w-md rounded-2xl border border-zinc-200/80 p-6 shadow-lg shadow-indigo-100/50 dark:border-zinc-800 dark:shadow-indigo-950/20">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-indigo-300 dark:via-violet-300 dark:to-fuchsia-300">
              {variant === "admin" ? "Admin login" : "Member login"}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Login using your email and password.</p>
          </div>
          <ThemeToggle />
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full rounded-xl border border-zinc-200 bg-white/90 px-3 py-2 text-sm outline-none ring-indigo-500/10 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900/80 dark:ring-indigo-300/20"
              placeholder="you@example.com"
            />
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Use lowercase email (example: <span className="font-medium">name@gmail.com</span>).
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="w-full rounded-xl border border-zinc-200 bg-white/90 px-3 py-2 text-sm outline-none ring-indigo-500/10 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900/80 dark:ring-indigo-300/20"
              placeholder="••••••••"
            />
          </div>

          <button
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-violet-300/40 transition hover:brightness-110 disabled:opacity-60 dark:shadow-violet-900/30"
            type="submit"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          <Link className="font-semibold hover:underline" href="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link className="font-semibold text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50" href="/signup">
            Sign up
          </Link>
        </div>

        <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          Switch login:{" "}
          {variant === "admin" ? (
            <Link className="font-semibold hover:underline" href="/login">
              Member login
            </Link>
          ) : (
            <Link className="font-semibold hover:underline" href="/admin/login">
              Admin login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

