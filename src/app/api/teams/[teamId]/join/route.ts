import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDb } from "@/lib/db";
import { jsonError, requireApiSession } from "@/lib/api";
import { Team } from "@/models/Team";

export const runtime = "nodejs";

export async function POST(_: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const session = await requireApiSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { teamId } = await params;
  if (!mongoose.Types.ObjectId.isValid(teamId)) return jsonError("Invalid teamId", 400);

  await connectDb();
  const team = await Team.findByIdAndUpdate(
    teamId,
    { $addToSet: { members: new mongoose.Types.ObjectId(session.user.id) } },
    { new: true }
  ).lean();

  if (!team) return jsonError("Team not found", 404);
  return NextResponse.json({ team });
}

