import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";

import { connectDb } from "@/lib/db";
import { jsonError, requireApiSession } from "@/lib/api";
import { Project } from "@/models/Project";
import { Team } from "@/models/Team";

export const runtime = "nodejs";

const CreateProjectSchema = z.object({
  name: z.string().min(2).max(160),
  teamId: z.string().min(1),
});

export async function GET(req: Request) {
  const session = await requireApiSession();
  if (!session) return jsonError("Unauthorized", 401);

  const url = new URL(req.url);
  const teamId = url.searchParams.get("teamId");

  await connectDb();

  if (teamId) {
    if (!mongoose.Types.ObjectId.isValid(teamId)) return jsonError("Invalid teamId", 400);

    const isMember = await Team.exists({ _id: teamId, members: session.user.id });
    if (!isMember) return jsonError("Forbidden", 403);

    const projects = await Project.find({ teamId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ projects });
  }

  const teams = await Team.find({ members: session.user.id }).select({ _id: 1 }).lean();
  const teamIds = teams.map((t) => t._id);
  const projects = await Project.find({ teamId: { $in: teamIds } }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!session) return jsonError("Unauthorized", 401);
  if (session.user.role !== "admin") return jsonError("Forbidden", 403);

  const body = await req.json().catch(() => null);
  const parsed = CreateProjectSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, { issues: parsed.error.flatten() });
  if (!mongoose.Types.ObjectId.isValid(parsed.data.teamId)) return jsonError("Invalid teamId", 400);

  await connectDb();
  const isMember = await Team.exists({ _id: parsed.data.teamId, members: session.user.id });
  if (!isMember) return jsonError("Forbidden", 403);

  const project = await Project.create({
    name: parsed.data.name,
    teamId: new mongoose.Types.ObjectId(parsed.data.teamId),
    createdBy: new mongoose.Types.ObjectId(session.user.id),
  });

  return NextResponse.json({ project }, { status: 201 });
}

