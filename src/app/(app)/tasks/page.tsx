import { requireSession } from "@/lib/authz";
import { TasksClient } from "@/app/(app)/tasks/TasksClient";
import { connectDb } from "@/lib/db";
import { Task } from "@/models/Task";
import { Team } from "@/models/Team";
import { Project } from "@/models/Project";

const NOW_TS = Date.now();

export default async function TasksPage() {
  const session = await requireSession();
  await connectDb();

  const tasks = await Task.find({ assignedTo: session.user.id })
    .sort({ dueDate: 1 })
    .populate("projectId", "name")
    .lean();

  const teams = await Team.find({ members: session.user.id }).select({ _id: 1 }).lean();
  const teamIds = teams.map((t) => t._id);
  const projects =
    session.user.role === "admin"
      ? await Project.find({ teamId: { $in: teamIds } }).sort({ createdAt: -1 }).lean()
      : [];
  const projectIds = projects.map((p) => p._id);
  const adminOverviewTasks =
    session.user.role === "admin"
      ? await Task.find({ projectId: { $in: projectIds } })
          .sort({ createdAt: -1 })
          .populate("projectId", "name")
          .populate("assignedTo", "name email")
          .lean()
      : [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Tasks</h1>
      <TasksClient
        isAdmin={session.user.role === "admin"}
        nowTs={NOW_TS}
        initialTasks={tasks.map((t) => ({
          _id: t._id.toString(),
          title: t.title,
          status: t.status,
          dueDate: t.dueDate.toISOString(),
          projectId:
            typeof t.projectId === "object" && t.projectId
              ? { name: (t.projectId as unknown as { name?: string }).name }
              : "-",
        }))}
        initialProjects={projects.map((p) => ({ _id: p._id.toString(), name: p.name, teamId: p.teamId.toString() }))}
        initialAdminTasks={adminOverviewTasks.map((t) => ({
          _id: t._id.toString(),
          title: t.title,
          status: t.status,
          dueDate: t.dueDate.toISOString(),
          project: ((t.projectId as unknown as { name?: string })?.name ?? "-") as string,
          assignee:
            ((t.assignedTo as unknown as { name?: string; email?: string })?.name ??
              (t.assignedTo as unknown as { email?: string })?.email ??
              "-") as string,
        }))}
      />
    </div>
  );
}

