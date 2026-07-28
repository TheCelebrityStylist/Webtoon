import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireStoryworldBranch, storyworldError } from "@/lib/storyworld/api";

export async function GET(_: Request, { params }: { params: Promise<{ projectId: string; branchId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: { code: "UNAUTHORIZED", message: "Sign in to continue" } }, { status: 401 });
  const { projectId, branchId } = await params;
  try {
    await requireStoryworldBranch(session.user.id, projectId, branchId);
    const diagnostics = await prisma.canonDiagnostic.findMany({ where: { branchId, status: "OPEN" }, orderBy: [{ severity: "desc" }, { createdAt: "asc" }] });
    return Response.json({ diagnostics }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return storyworldError(error);
  }
}
