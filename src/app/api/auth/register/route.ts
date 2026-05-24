import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { connectDb } from "@/lib/db";
import { User } from "@/models/User";

export const runtime = "nodejs";

const RegisterSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(200),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  await connectDb();

  const existing = await User.findOne({ email: parsed.data.email }).lean();
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const isFirstUser = (await User.countDocuments({}).lean()) === 0;

  const user = await User.create({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
    role: isFirstUser ? "admin" : "member",
  });

  return NextResponse.json(
    { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    { status: 201 }
  );
}

