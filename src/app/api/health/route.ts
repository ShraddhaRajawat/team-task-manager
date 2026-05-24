import { NextResponse } from "next/server";

import { connectDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDb();
    return NextResponse.json({ ok: true, db: "connected" });
  } catch {
    return NextResponse.json({ ok: false, db: "error" }, { status: 500 });
  }
}

