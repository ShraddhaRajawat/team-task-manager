"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

import { ThemeToggle } from "@/components/ThemeToggle";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    setLoading(false);

    if (!res.ok) {
      toast.error("Failed to send reset email");
      return;
    }
    toast.success("If this email exists, we sent a reset link.");
    setEmail("");
  }

  return (
    <div className="fancy-page-bg flex min-h-screen items-center justify-center bg-zinc-50 px-4 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="fancy-card w-full max-w-md rounded-2xl border border-zinc-200/80 p-6 shadow-lg shadow-indigo-100/50 dark:border-zinc-800 dark:shadow-indigo-950/20">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-indigo-300 dark:via-violet-300 dark:to-fuchsia-300">
              Forgot password
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">We will email you a reset link.</p>
          </div>
          <ThemeToggle />
        </div>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full rounded-xl border border-zinc-200 bg-white/90 px-3 py-2 text-sm outline-none ring-indigo-500/10 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900/80 dark:ring-indigo-300/20"
              placeholder="name@gmail.com"
            />
          </div>

          <button
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-violet-300/40 transition hover:brightness-110 disabled:opacity-60 dark:shadow-violet-900/30"
            type="submit"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Back to{" "}
          <Link className="font-semibold hover:underline" href="/login">
            login
          </Link>
        </div>
      </div>
    </div>
  );
}

