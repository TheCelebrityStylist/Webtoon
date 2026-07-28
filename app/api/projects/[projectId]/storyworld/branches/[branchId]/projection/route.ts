import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireStoryworldBranch, storyworldError } from "@/lib/storyworld/api";

export async function GET(request: Request, { params }: { params: Promise<{ projectId: string; branchId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: { code: "UNAUTHORIZED", message: "Sign in to continue" } }, { status: 401 });
  const { projectId, branchId } = await params;
  const sequence = Number(new URL(request.url).searchParams.get("sequence") ?? Number.MAX_SAFE_INTEGER);
  try {
    await requireStoryworldBranch(session.user.id, projectId, branchId);
    const projections = await prisma.canonProjection.findMany({ where: { branchId, atManuscriptSequence: { lte: sequence } }, orderBy: { atManuscriptSequence: "desc" }, distinct: ["entityId", "projectionType"] });
    return Response.json({ branchId, atManuscriptSequence: projections[0]?.atManuscriptSequence ?? 0, projections }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return storyworldError(error);
  }
}
