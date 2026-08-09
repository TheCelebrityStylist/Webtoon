import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireStoryworldBranch, storyworldError } from "@/lib/storyworld/api";

export async function POST(_: Request, { params }: { params: Promise<{ projectId: string; branchId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: { code: "UNAUTHORIZED", message: "Sign in to continue" } }, { status: 401 });
  const { projectId, branchId } = await params;
  try {
    const { branch } = await requireStoryworldBranch(session.user.id, projectId, branchId, ["OWNER", "WRITER", "EDITOR"]);
    if (!branch.parentId) return Response.json({ error: { code: "MAIN_BRANCH_IMMUTABLE", message: "Main cannot be archived" } }, { status: 422 });
    const archived = await prisma.canonBranch.update({ where: { id: branch.id }, data: { status: "ARCHIVED", active: false } });
    return Response.json({ branch: archived });
  } catch (error) {
    return storyworldError(error);
  }
}
