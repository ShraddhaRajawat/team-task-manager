import { Suspense } from "react";

import { ResetPasswordClient } from "@/app/reset-password/resetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-black" />}>
      <ResetPasswordClient />
    </Suspense>
  );
}

