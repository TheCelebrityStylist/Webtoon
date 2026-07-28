import { z } from "zod";
import { auth } from "@/auth";
import { requireStoryworldAccess, storyworldError } from "@/lib/storyworld/api";
import { revertStoryworldMerge } from "@/lib/storyworld/branches/merge-branch";

const inputSchema = z.object({ expectedUniverseVersion: z.number().int().nonnegative() });

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string; commitId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: { code: "UNAUTHORIZED", message: "Sign in to continue" } }, { status: 401 });
  const { projectId, commitId } = await params;
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: { code: "INVALID_REVERT", message: "Revert request is invalid" } }, { status: 400 });
  try {
    await requireStoryworldAccess(session.user.id, projectId, ["OWNER", "WRITER", "EDITOR"]);
    return Response.json(await revertStoryworldMerge({ projectId, userId: session.user.id, commitId, expectedUniverseVersion: parsed.data.expectedUniverseVersion }));
  } catch (error) {
    return storyworldError(error);
  }
}
