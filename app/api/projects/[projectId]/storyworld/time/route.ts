import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireStoryworldBranch, storyworldError } from "@/lib/storyworld/api";

export async function GET(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: { code: "UNAUTHORIZED", message: "Sign in to continue" } }, { status: 401 });
  const { projectId } = await params;
  const branchId = new URL(request.url).searchParams.get("branchId");
  if (!branchId) return Response.json({ error: { code: "BRANCH_REQUIRED", message: "Choose a branch" } }, { status: 400 });
  try {
    await requireStoryworldBranch(session.user.id, projectId, branchId);
    const points = await prisma.canonProjection.findMany({ where: { branchId }, distinct: ["atManuscriptSequence"], orderBy: { atManuscriptSequence: "asc" }, select: { atManuscriptSequence: true, sourceCommitId: true } });
    return Response.json({ branchId, points }, { headers: { "cache-control": "private, max-age=30" } });
  } catch (error) {
    return storyworldError(error);
  }
}
