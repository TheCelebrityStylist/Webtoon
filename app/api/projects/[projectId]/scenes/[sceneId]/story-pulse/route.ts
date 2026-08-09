import { auth } from "@/auth";
import { ensureCanonUniverse } from "@/lib/canon/repository";
import { storyAnalysisInputSchema, validatedResult } from "@/lib/canon/story-pulse";
import { storyProvider } from "@/lib/canon/providers";
import { prisma } from "@/lib/prisma";
import { requireSceneAccess } from "@/server/scene-access";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string; sceneId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId, sceneId } = await params;
  try {
    await requireSceneAccess(session.user.id, projectId, sceneId, ["OWNER", "WRITER", "EDITOR"]);
    const parsed = storyAnalysisInputSchema.safeParse(await request.json());
    if (!parsed.success || parsed.data.projectId !== projectId || parsed.data.sceneId !== sceneId) {
      return Response.json({ error: "Invalid changed-block analysis request", details: parsed.success ? undefined : parsed.error.flatten() }, { status: 400 });
    }
    const scene = await prisma.scene.findUnique({ where: { id: sceneId }, select: { revision: true, manuscriptText: true } });
    if (!scene || scene.revision !== parsed.data.revision) return Response.json({ error: "The manuscript revision changed", revision: scene?.revision }, { status: 409 });
    const universe = await ensureCanonUniverse(projectId);
    const provider = storyProvider();
    const result = validatedResult(parsed.data, await provider.analyze(parsed.data));
    const run = await prisma.canonAnalysisRun.create({
      data: {
        universeId: universe.id,
        sceneId,
        requestedById: session.user.id,
        requestId: result.requestId,
        revision: result.revision,
        manuscriptHash: result.manuscriptHash,
        provider: result.provider,
        model: result.provider === "openai" ? process.env.OPENAI_STORY_MODEL ?? "gpt-4.1-mini" : null,
        status: "COMPLETED",
        inputSummary: { blockIds: parsed.data.blocks.map((block) => block.id), blockCount: parsed.data.blocks.length },
        warning: result.warnings.join(" ") || null,
        completedAt: new Date(),
        proposals: {
          create: result.proposals.map((proposal) => ({
            id: proposal.id,
            kind: proposal.kind,
            entityType: proposal.entityType,
            entityName: proposal.entityName,
            entityId: proposal.entityId,
            property: proposal.property,
            beforeValue: proposal.beforeValue === undefined ? undefined : JSON.parse(JSON.stringify(proposal.beforeValue)),
            afterValue: proposal.afterValue === undefined ? undefined : JSON.parse(JSON.stringify(proposal.afterValue)),
            evidence: proposal.evidence,
            confidence: proposal.confidence,
            perspective: proposal.perspective,
          })),
        },
      },
      include: { proposals: true },
    });
    return Response.json({ runId: run.id, canonVersion: universe.version, ...result }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Story analysis failed" }, { status: 500 });
  }
}
