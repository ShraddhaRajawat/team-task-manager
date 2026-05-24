import { NextResponse } from "next/server";
import { z } from "zod";

import { connectDb } from "@/lib/db";
import { User } from "@/models/User";

export const runtime = "nodejs";

const QuerySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({ email: url.searchParams.get("email") ?? "" });
  if (!parsed.success) {
    return NextResponse.json({ exists: false, error: "Invalid email" }, { status: 400 });
  }

  await connectDb();
  const exists = await User.exists({ email: parsed.data.email });
  return NextResponse.json({ exists: !!exists });
}

