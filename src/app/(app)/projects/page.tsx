import { requireSession } from "@/lib/authz";
import { ProjectsClient } from "@/app/(app)/projects/ProjectsClient";
import { connectDb } from "@/lib/db";
import { Team } from "@/models/Team";
import { Project } from "@/models/Project";

export default async function ProjectsPage() {
  const session = await requireSession();
  await connectDb();

  const teams = await Team.find({ members: session.user.id }).sort({ createdAt: -1 }).lean();
  const teamIds = teams.map((t) => t._id);
  const projects = await Project.find({ teamId: { $in: teamIds } }).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
      <ProjectsClient
        isAdmin={session.user.role === "admin"}
        initialTeams={teams.map((t) => ({ _id: t._id.toString(), name: t.name }))}
        initialProjects={projects.map((p) => ({ _id: p._id.toString(), name: p.name, teamId: p.teamId.toString() }))}
      />
    </div>
  );
}

