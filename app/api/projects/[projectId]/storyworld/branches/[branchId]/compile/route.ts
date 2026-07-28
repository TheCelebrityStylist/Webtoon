import { z } from "zod";
import { auth } from "@/auth";
import { requireStoryworldBranch, storyworldError } from "@/lib/storyworld/api";
import { compilePersistedBranch } from "@/lib/storyworld/compiler/compile-branch";

const inputSchema = z.object({ trigger: z.enum(["MANUSCRIPT_CHANGED", "EVENT_CONFIRMED", "BRANCH_CREATED", "MANUAL"]), earliestAffectedSequence: z.number().int().nonnegative().optional() });

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string; branchId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: { code: "UNAUTHORIZED", message: "Sign in to continue" } }, { status: 401 });
  const { projectId, branchId } = await params;
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: { code: "INVALID_COMPILE", message: "Compile request is invalid" } }, { status: 400 });
  try {
    await requireStoryworldBranch(session.user.id, projectId, branchId, ["OWNER", "WRITER", "EDITOR"]);
    return Response.json(await compilePersistedBranch({ projectId, branchId, ...parsed.data }));
  } catch (error) {
    return storyworldError(error);
  }
}
