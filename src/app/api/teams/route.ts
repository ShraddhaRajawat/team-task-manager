import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";

import { connectDb } from "@/lib/db";
import { jsonError, requireApiSession } from "@/lib/api";
import { Team } from "@/models/Team";

export const runtime = "nodejs";

const CreateTeamSchema = z.object({
  name: z.string().min(2).max(120),
});

export async function GET() {
  const session = await requireApiSession();
  if (!session) return jsonError("Unauthorized", 401);

  await connectDb();
  const teams = await Team.find({ members: session.user.id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ teams });
}

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!session) return jsonError("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  const parsed = CreateTeamSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, { issues: parsed.error.flatten() });

  await connectDb();
  const team = await Team.create({
    name: parsed.data.name,
    members: [new mongoose.Types.ObjectId(session.user.id)],
  });

  return NextResponse.json({ team }, { status: 201 });
}

