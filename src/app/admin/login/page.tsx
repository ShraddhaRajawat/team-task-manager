import { Suspense } from "react";

import { LoginClient } from "@/app/login/LoginClient";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-black" />}>
      <LoginClient variant="admin" />
    </Suspense>
  );
}

