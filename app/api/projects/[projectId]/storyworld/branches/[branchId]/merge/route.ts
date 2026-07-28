import { z } from "zod";
import { auth } from "@/auth";
import { requireStoryworldBranch, storyworldError } from "@/lib/storyworld/api";
import { mergeStoryworldBranch } from "@/lib/storyworld/branches/merge-branch";

const inputSchema = z.object({ expectedUniverseVersion: z.number().int().nonnegative(), selectedChanges: z.object({ eventIds: z.array(z.string().min(1)).max(500), sceneIds: z.array(z.string().min(1)).max(100) }) });

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string; branchId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: { code: "UNAUTHORIZED", message: "Sign in to continue" } }, { status: 401 });
  const { projectId, branchId } = await params;
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: { code: "INVALID_MERGE", message: "Merge selection is invalid" } }, { status: 400 });
  try {
    await requireStoryworldBranch(session.user.id, projectId, branchId, ["OWNER", "WRITER", "EDITOR"]);
    return Response.json(await mergeStoryworldBranch({ projectId, userId: session.user.id, sourceBranchId: branchId, expectedUniverseVersion: parsed.data.expectedUniverseVersion, selection: parsed.data.selectedChanges }));
  } catch (error) {
    return storyworldError(error);
  }
}
