import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireStoryworldBranch, storyworldError } from "@/lib/storyworld/api";
import { loadEffectiveBranchEvents } from "@/lib/storyworld/compiler/compile-branch";
import { replayProjection } from "@/lib/storyworld/compiler/projection-builder";
import { diagnoseStoryworld } from "@/lib/storyworld/compiler/diagnostic-engine";
import { compareBranchState } from "@/lib/storyworld/branches/branch-diff";

export async function GET(_: Request, { params }: { params: Promise<{ projectId: string; branchId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: { code: "UNAUTHORIZED", message: "Sign in to continue" } }, { status: 401 });
  const { projectId, branchId } = await params;
  try {
    const { branch } = await requireStoryworldBranch(session.user.id, projectId, branchId);
    const main = branch.parentId ? await prisma.canonBranch.findUnique({ where: { id: branch.parentId } }) : branch;
    if (!main) return Response.json({ error: { code: "BASE_BRANCH_NOT_FOUND", message: "Base branch not found" } }, { status: 404 });
    const [mainEvents, branchEvents] = await Promise.all([loadEffectiveBranchEvents(main.id), loadEffectiveBranchEvents(branch.id)]);
    const mainProjection = replayProjection(main.id, mainEvents);
    const branchProjection = replayProjection(branch.id, branchEvents);
    const mainDiagnostics = diagnoseStoryworld(mainProjection, mainEvents);
    const branchDiagnostics = diagnoseStoryworld(branchProjection, branchEvents);
    const differences = compareBranchState({ mainEvents, branchEvents, mainProjection, branchProjection, mainDiagnostics, branchDiagnostics });
    return Response.json({ baseBranchId: main.id, branchId, differences, summary: { events: branchEvents.length - mainEvents.length, entityStates: differences.filter((difference) => difference.recordType === "ENTITY_STATE").length, introducedRisks: differences.filter((difference) => difference.kind === "INTRODUCED_RISK").length } }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return storyworldError(error);
  }
}
