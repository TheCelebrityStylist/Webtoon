import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/storyworld/domain/types";
import { quoteHash } from "@/lib/storyworld/compiler/evidence-resolver";
import { requireStoryworldBranch, storyworldError } from "@/lib/storyworld/api";

const inputSchema = z.object({
  branchId: z.string().min(1),
  expectedUniverseVersion: z.number().int().nonnegative(),
  events: z.array(eventSchema.omit({ id: true, commitId: true, branchId: true, status: true })).min(1).max(100),
});

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: { code: "UNAUTHORIZED", message: "Sign in to continue" } }, { status: 401 });
  const { projectId } = await params;
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: { code: "INVALID_EVENTS", message: "Confirmed events are invalid", details: parsed.error.flatten() } }, { status: 400 });
  try {
    const { universe } = await requireStoryworldBranch(session.user.id, projectId, parsed.data.branchId, ["OWNER", "WRITER", "EDITOR"]);
    const sceneIds = [...new Set(parsed.data.events.flatMap((event) => event.evidence.map((evidence) => evidence.sceneId)))];
    const scenes = await prisma.scene.findMany({ where: { id: { in: sceneIds }, chapter: { seriesId: projectId } }, select: { id: true } });
    if (scenes.length !== sceneIds.length) return Response.json({ error: { code: "EVIDENCE_OUTSIDE_PROJECT", message: "Evidence must belong to this project" } }, { status: 422 });
    for (const event of parsed.data.events) for (const evidence of event.evidence) {
      if (evidence.sourceType === "MANUSCRIPT" && quoteHash(evidence.exactQuote) !== evidence.quoteHash) return Response.json({ error: { code: "EVIDENCE_HASH_MISMATCH", message: "Evidence quotation changed before confirmation" } }, { status: 409 });
    }
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.canonUniverse.findUniqueOrThrow({ where: { id: universe.id }, select: { version: true } });
      if (current.version !== parsed.data.expectedUniverseVersion) throw Object.assign(new Error("Storyworld changed"), { code: "STALE_STORYWORLD", status: 409 });
      const commit = await tx.canonCommit.create({ data: { universeId: universe.id, requestedById: session.user.id, expectedVersion: current.version, resultingVersion: current.version + 1 } });
      const created = [];
      for (const event of parsed.data.events) created.push(await tx.canonEvent.create({
        data: {
          universeId: universe.id,
          branchId: parsed.data.branchId,
          commitId: commit.id,
          eventType: event.type,
          subjectEntityId: event.subjectEntityId,
          objectEntityId: event.objectEntityId,
          predicate: event.predicate,
          valueJson: event.value === undefined ? undefined : JSON.parse(JSON.stringify(event.value)),
          perspective: event.perspective.kind,
          perspectiveEntityId: "perspectiveEntityId" in event.perspective ? event.perspective.perspectiveEntityId : undefined,
          manuscriptSequence: event.coordinate.manuscriptSequence,
          storySequence: event.coordinate.storySequence,
          storyDateStart: event.coordinate.storyDate,
          sourceSceneId: event.evidence[0]?.sceneId,
          evidenceId: event.evidence[0]?.id,
          evidence: JSON.parse(JSON.stringify(event.evidence)),
          status: "CONFIRMED",
        },
      }));
      await tx.canonUniverse.update({ where: { id: universe.id }, data: { version: { increment: 1 } } });
      return { commitId: commit.id, resultingVersion: current.version + 1, events: created };
    });
    return Response.json(result, { status: 201 });
  } catch (error) {
    return storyworldError(error);
  }
}
