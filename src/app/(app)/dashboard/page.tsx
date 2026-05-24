import { connectDb } from "@/lib/db";
import { requireSession } from "@/lib/authz";
import { Task } from "@/models/Task";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="interactive-card rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white via-indigo-50/40 to-violet-50/40 p-4 shadow-md shadow-indigo-100/60 backdrop-blur dark:border-zinc-900 dark:from-zinc-950 dark:via-indigo-950/10 dark:to-violet-950/10 dark:shadow-indigo-950/30">
      <div className="text-sm text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function BarCard({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="interactive-card rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white via-fuchsia-50/30 to-indigo-50/30 p-4 shadow-md shadow-fuchsia-100/60 backdrop-blur dark:border-zinc-900 dark:from-zinc-950 dark:via-fuchsia-950/10 dark:to-indigo-950/10 dark:shadow-fuchsia-950/30">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">{label}</div>
        <div className="text-sm font-semibold">{pct.toFixed(0)}%</div>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-900">
        <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function statusPill(status: string) {
  if (status === "Done") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
  if (status === "In Progress") return "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300";
  return "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300";
}

export default async function DashboardPage() {
  const session = await requireSession();
  await connectDb();

  const userId = session.user.id;
  const now = new Date();

  const [total, completed, overdue, tasks] = await Promise.all([
    Task.countDocuments({ assignedTo: userId }),
    Task.countDocuments({ assignedTo: userId, status: "Done" }),
    Task.countDocuments({ assignedTo: userId, status: { $ne: "Done" }, dueDate: { $lt: now } }),
    Task.find({ assignedTo: userId })
      .sort({ dueDate: 1 })
      .limit(10)
      .populate("projectId", "name")
      .lean(),
  ]);

  const completedPct = total === 0 ? 0 : (completed / total) * 100;
  const overduePct = total === 0 ? 0 : (overdue / total) * 100;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200/80 bg-gradient-to-r from-indigo-50 via-violet-50 to-fuchsia-50 p-4 shadow-sm dark:border-zinc-900 dark:from-zinc-950 dark:via-violet-950/20 dark:to-zinc-950">
        <h1 className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-indigo-300 dark:via-violet-300 dark:to-fuchsia-300">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Your task stats and upcoming deadlines.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total tasks" value={total} />
        <StatCard label="Completed tasks" value={completed} />
        <StatCard label="Overdue tasks" value={overdue} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <BarCard label="Completion" value={completedPct} color="#16a34a" />
        <BarCard label="Overdue" value={overduePct} color="#dc2626" />
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white/90 shadow-sm backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/80">
        <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold dark:border-zinc-900">
          Upcoming tasks
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Due</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t._id.toString()} className="fancy-row border-t border-zinc-100 dark:border-zinc-900">
                  <td className="px-4 py-3 font-medium">{t.title}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                    {(t.projectId as unknown as { name?: string })?.name ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusPill(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(t.dueDate).toLocaleDateString()}</td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr className="border-t border-zinc-100 dark:border-zinc-900">
                  <td className="px-4 py-6 text-center text-zinc-500 dark:text-zinc-400" colSpan={4}>
                    No tasks yet.
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

