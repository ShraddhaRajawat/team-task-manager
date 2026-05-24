"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type TaskItem = {
  _id: string;
  title: string;
  status: "Todo" | "In Progress" | "Done";
  dueDate: string;
  projectId?: { name?: string } | string;
};
type AdminOverviewTask = {
  _id: string;
  title: string;
  status: "Todo" | "In Progress" | "Done";
  dueDate: string;
  project: string;
  assignee: string;
};

type ProjectItem = { _id: string; name: string; teamId: string };
type UserItem = { _id: string; name: string; email: string; role: "admin" | "member" };

const STATUSES: TaskItem["status"][] = ["Todo", "In Progress", "Done"];

function statusPill(status: TaskItem["status"]) {
  if (status === "Done") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
  if (status === "In Progress") return "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300";
  return "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300";
}

export function TasksClient({
  isAdmin,
  initialTasks,
  initialProjects,
  initialAdminTasks,
  nowTs,
}: {
  isAdmin: boolean;
  initialTasks: TaskItem[];
  initialProjects: ProjectItem[];
  initialAdminTasks: AdminOverviewTask[];
  nowTs: number;
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);

  const [projects] = useState<ProjectItem[]>(initialProjects);
  const [assignees, setAssignees] = useState<UserItem[]>([]);
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");

  const overdueSet = useMemo(() => {
    return new Set(
      tasks
        .filter((t) => t.status !== "Done" && new Date(t.dueDate).getTime() < nowTs)
        .map((t) => t._id)
    );
  }, [tasks, nowTs]);

  async function loadAssigneesForProject(pid: string) {
    const p = projects.find((x) => x._id === pid);
    if (!p) return;
    const res = await fetch(`/api/users?teamId=${p.teamId}`, { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { users: UserItem[] };
    setAssignees((data.users ?? []).map((u) => ({ ...u, _id: String(u._id) })));
  }

  async function createTask() {
    const parsedDue = new Date(dueDate);
    if (!dueDate || Number.isNaN(parsedDue.getTime())) {
      toast.error("Please select a valid due date/time");
      return;
    }

    setCreating(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        projectId,
        assignedTo,
        // datetime-local value is converted to ISO so API validation passes
        dueDate: parsedDue.toISOString(),
      }),
    });
    setCreating(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      toast.error(data?.error ?? "Failed to create task");
      return;
    }
    toast.success("Task created");
    setTitle("");
    setDescription("");
    setAssignedTo("");
    setDueDate("");
    router.refresh();
  }

  async function updateStatus(taskId: string, status: TaskItem["status"]) {
    const prev = tasks;
    setTasks((t) => t.map((x) => (x._id === taskId ? { ...x, status } : x)));
    const res = await fetch(`/api/tasks/${taskId}/status`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setTasks(prev);
      toast.error("Failed to update status");
      return;
    }
    toast.success("Status updated");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <>
          <div className="interactive-card rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/80">
            <div className="text-sm font-semibold">Create task (Admin)</div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                className="interactive-input w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
              />
              <input
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                type="datetime-local"
                className="interactive-input w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
              />
              <select
                value={projectId}
                onChange={(e) => {
                  const pid = e.target.value;
                  setProjectId(pid);
                  setAssignedTo("");
                  setAssignees([]);
                  if (pid) void loadAssigneesForProject(pid);
                }}
                className="interactive-input w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="interactive-input w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="">Assign to</option>
                {assignees.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className="interactive-input md:col-span-2 w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
                rows={3}
              />
              <button
                type="button"
                disabled={creating || title.trim().length < 2 || !projectId || !assignedTo || !dueDate}
                onClick={() => void createTask()}
                className="interactive-button md:col-span-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {creating ? "Creating..." : "Create task"}
              </button>
            </div>
          </div>

          <div className="interactive-card rounded-2xl border border-zinc-200/80 bg-white/90 shadow-sm backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/80">
            <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold dark:border-zinc-900">
              Assigned tasks overview (Admin)
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">Task</th>
                    <th className="px-4 py-3">Assignee</th>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Due</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {initialAdminTasks.map((t) => (
                    <tr key={t._id} className="fancy-row border-t border-zinc-100 dark:border-zinc-900">
                      <td className="px-4 py-3 font-medium">{t.title}</td>
                      <td className="px-4 py-3">{t.assignee}</td>
                      <td className="px-4 py-3">{t.project}</td>
                      <td className="px-4 py-3">{new Date(t.dueDate).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusPill(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {initialAdminTasks.length === 0 && (
                    <tr className="border-t border-zinc-100 dark:border-zinc-900">
                      <td className="px-4 py-6 text-center text-zinc-500 dark:text-zinc-400" colSpan={5}>
                        No assigned tasks found yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="interactive-card rounded-2xl border border-zinc-200/80 bg-white/90 shadow-sm backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/80">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-900">
        <div>
          <div className="text-sm font-semibold">Your tasks</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">Update your task status.</div>
        </div>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t._id} className="fancy-row border-t border-zinc-100 dark:border-zinc-900">
                <td className="px-4 py-3 font-medium">{t.title}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                  {typeof t.projectId === "string" ? "-" : t.projectId?.name ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <span className={overdueSet.has(t._id) ? "font-semibold text-red-600 dark:text-red-400" : ""}>
                    {new Date(t.dueDate).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={t.status}
                    onChange={(e) => void updateStatus(t._id, e.target.value as TaskItem["status"])}
                    className="rounded-lg border border-zinc-200 bg-white px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-50/10"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr className="border-t border-zinc-100 dark:border-zinc-900">
                <td className="px-4 py-6 text-center text-zinc-500 dark:text-zinc-400" colSpan={4}>
                  No tasks assigned yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}

