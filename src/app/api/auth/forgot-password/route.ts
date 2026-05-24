import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { connectDb } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { User } from "@/models/User";

export const runtime = "nodejs";

const BodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: true }, { status: 200 });

  const email = parsed.data.email;
  await connectDb();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

  user.resetPasswordTokenHash = tokenHash;
  user.resetPasswordExpiresAt = expiresAt;
  await user.save();

  const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const baseUrl = appUrl.endsWith("/") ? appUrl.slice(0, -1) : appUrl;
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  await sendMail({
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5">
        <h2>Password reset</h2>
        <p>Click the link below to reset your password. This link expires in 30 minutes.</p>
        <p><a href="${resetUrl}">Reset password</a></p>
        <p>If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}

