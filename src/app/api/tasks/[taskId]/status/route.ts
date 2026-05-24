import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";

import { connectDb } from "@/lib/db";
import { jsonError, requireApiSession } from "@/lib/api";
import { Task } from "@/models/Task";

export const runtime = "nodejs";

const UpdateStatusSchema = z.object({
  status: z.enum(["Todo", "In Progress", "Done"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ taskId: string }> }) {
  const session = await requireApiSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { taskId } = await params;
  if (!mongoose.Types.ObjectId.isValid(taskId)) return jsonError("Invalid taskId", 400);

  const body = await req.json().catch(() => null);
  const parsed = UpdateStatusSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid input", 400, { issues: parsed.error.flatten() });

  await connectDb();
  const task = await Task.findById(taskId).lean();
  if (!task) return jsonError("Task not found", 404);

  const canUpdate =
    session.user.role === "admin" || task.assignedTo.toString() === session.user.id.toString();
  if (!canUpdate) return jsonError("Forbidden", 403);

  const updated = await Task.findByIdAndUpdate(taskId, { status: parsed.data.status }, { new: true }).lean();
  return NextResponse.json({ task: updated });
}

