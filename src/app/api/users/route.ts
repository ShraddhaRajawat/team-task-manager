import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDb } from "@/lib/db";
import { jsonError, requireApiSession } from "@/lib/api";
import { Team } from "@/models/Team";
import { User } from "@/models/User";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await requireApiSession();
  if (!session) return jsonError("Unauthorized", 401);

  const url = new URL(req.url);
  const teamId = url.searchParams.get("teamId");

  await connectDb();

  if (teamId) {
    if (!mongoose.Types.ObjectId.isValid(teamId)) return jsonError("Invalid teamId", 400);
    const team = await Team.findOne({ _id: teamId, members: session.user.id })
      .populate("members", "name email role")
      .lean();
    if (!team) return jsonError("Forbidden", 403);
    return NextResponse.json({ users: team.members });
  }

  if (session.user.role !== "admin") return jsonError("Forbidden", 403);
  const users = await User.find({}).select({ name: 1, email: 1, role: 1 }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ users });
}

