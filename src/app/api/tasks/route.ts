import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";

import { connectDb } from "@/lib/db";
import { jsonError, requireApiSession } from "@/lib/api";
import { Project } from "@/models/Project";
import { Task } from "@/models/Task";
import { Team } from "@/models/Team";

export const runtime = "nodejs";

const CreateTaskSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(4000).optional(),
  assignedTo: z.string().min(1),
  projectId: z.string().min(1),
  dueDate: z.string().min(1),
});

export async function GET(req: Request) {
  const session = await requireApiSession();
  if (!session) return jsonError("Unauthorized", 401);

  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId");
  const assignedTo = url.searchParams.get("assignedTo");

  await connectDb();

  const filter: Record<string, unknown> = {};
  if (projectId) {
    if (!mongoose.Types.ObjectId.isValid(projectId)) return jsonError("Invalid projectId", 400);
    filter.projectId = projectId;
  }

  if (session.user.role === "admin") {
    if (assignedTo) {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) return jsonError("Invalid assignedTo", 400);
      filter.assignedTo = assignedTo;
    }
  } else {
    filter.assignedTo = session.user.id;
  }

  const tasks = await Task.find(filter).sort({ dueDate: 1 }).populate("projectId", "name").lean();
  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (!session) return jsonError("Unauthorized", 401);
  if (session.user.role !== "admin") return jsonError("Forbidden", 403);

  const body = await req.json().catch(() => null);
  const parsed = CreateTaskSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, { issues: parsed.error.flatten() });

  const { title, description, assignedTo, projectId, dueDate } = parsed.data;
  if (!mongoose.Types.ObjectId.isValid(assignedTo)) return jsonError("Invalid assignedTo", 400);
  if (!mongoose.Types.ObjectId.isValid(projectId)) return jsonError("Invalid projectId", 400);
  const parsedDueDate = new Date(dueDate);
  if (Number.isNaN(parsedDueDate.getTime())) return jsonError("Invalid dueDate", 400);

  await connectDb();

  const project = await Project.findById(projectId).lean();
  if (!project) return jsonError("Project not found", 404);

  const isAdminMember = await Team.exists({ _id: project.teamId, members: session.user.id });
  if (!isAdminMember) return jsonError("Forbidden", 403);

  const isAssigneeMember = await Team.exists({ _id: project.teamId, members: assignedTo });
  if (!isAssigneeMember) return jsonError("Assignee must be a member of the team", 400);

  const task = await Task.create({
    title,
    description: description ?? "",
    assignedTo: new mongoose.Types.ObjectId(assignedTo),
    projectId: new mongoose.Types.ObjectId(projectId),
    status: "Todo",
    dueDate: parsedDueDate,
  });

  return NextResponse.json({ task }, { status: 201 });
}

