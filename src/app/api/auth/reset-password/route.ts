import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { connectDb } from "@/lib/db";
import { User } from "@/models/User";

export const runtime = "nodejs";

const BodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  token: z.string().min(10),
  newPassword: z.string().min(6).max(200),
});

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  await connectDb();

  const tokenHash = hashToken(parsed.data.token);
  const user = await User.findOne({
    email: parsed.data.email,
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  }

  user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  user.resetPasswordTokenHash = null;
  user.resetPasswordExpiresAt = null;
  await user.save();

  return NextResponse.json({ ok: true });
}

