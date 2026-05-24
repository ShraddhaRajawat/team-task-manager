"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Team = { _id: string; name: string };
type Project = { _id: string; name: string; teamId: string };

export function ProjectsClient({
  isAdmin,
  initialTeams,
  initialProjects,
}: {
  isAdmin: boolean;
  initialTeams: Team[];
  initialProjects: Project[];
}) {
  const router = useRouter();
  const [teams] = useState<Team[]>(initialTeams);
  const [projects] = useState<Project[]>(initialProjects);

  const [teamName, setTeamName] = useState("");
  const [joinTeamId, setJoinTeamId] = useState("");

  const [projectName, setProjectName] = useState("");
  const [projectTeamId, setProjectTeamId] = useState("");

  const teamOptions = useMemo(() => teams.map((t) => ({ id: t._id, name: t.name })), [teams]);

  async function createTeam() {
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: teamName }),
    });
    if (!res.ok) {
      toast.error("Failed to create team");
      return;
    }
    setTeamName("");
    toast.success("Team created");
    router.refresh();
  }

  async function joinTeam() {
    const res = await fetch(`/api/teams/${joinTeamId}/join`, { method: "POST" });
    if (!res.ok) {
      toast.error("Failed to join team");
      return;
    }
    setJoinTeamId("");
    toast.success("Joined team");
    router.refresh();
  }

  async function createProject() {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: projectName, teamId: projectTeamId }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      toast.error(data?.error ?? "Failed to create project");
      return;
    }
    setProjectName("");
    toast.success("Project created");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200/80 bg-gradient-to-r from-violet-50 to-indigo-50 p-4 shadow-sm dark:border-zinc-900 dark:from-zinc-950 dark:to-zinc-900">
        <div className="text-sm font-semibold">Team workspace</div>
        <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Create teams, invite members, and organize projects in one place.
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="interactive-card rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/80">
          <div className="text-sm font-semibold">Create team</div>
          <div className="mt-3 flex gap-2">
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Team name"
              className="interactive-input w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
            />
            <button
              type="button"
              disabled={teamName.trim().length < 2}
              onClick={() => void createTeam()}
              className="interactive-button rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Create
            </button>
          </div>
        </div>

        <div className="interactive-card rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/80">
          <div className="text-sm font-semibold">Join team</div>
          <div className="mt-3 flex gap-2">
            <input
              value={joinTeamId}
              onChange={(e) => setJoinTeamId(e.target.value)}
              placeholder="Paste Team ID"
              className="interactive-input w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
            />
            <button
              type="button"
              disabled={!joinTeamId.trim()}
              onClick={() => void joinTeam()}
              className="interactive-button rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            >
              Join
            </button>
          </div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Tip: share the team&apos;s MongoDB `_id` to let others join quickly.
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="interactive-card rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/80">
          <div className="text-sm font-semibold">Create project (Admin)</div>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project name"
              className="interactive-input w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
            />
            <select
              value={projectTeamId}
              onChange={(e) => setProjectTeamId(e.target.value)}
              className="interactive-input w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
            >
              <option value="">Select team</option>
              {teamOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void createProject()}
              disabled={projectName.trim().length < 2 || !projectTeamId}
              className="interactive-button rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Create project
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="interactive-card rounded-2xl border border-zinc-200/80 bg-white/90 shadow-sm backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/80">
          <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold dark:border-zinc-900">
            Your teams
          </div>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {teams.map((t) => (
              <li key={t._id} className="px-4 py-3">
                <div className="text-sm font-medium">{t.name}</div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">ID: {t._id}</div>
              </li>
            ))}
            {teams.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">No teams yet.</li>
            )}
          </ul>
        </div>

        <div className="interactive-card rounded-2xl border border-zinc-200/80 bg-white/90 shadow-sm backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/80">
          <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold dark:border-zinc-900">
            Projects
          </div>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {projects.map((p) => (
              <li key={p._id} className="px-4 py-3">
                <div className="text-sm font-medium">{p.name}</div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Team: {p.teamId}</div>
              </li>
            ))}
            {projects.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">No projects yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

