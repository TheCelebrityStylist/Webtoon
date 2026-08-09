import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireStoryworldBranch, storyworldError } from "@/lib/storyworld/api";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ projectId: string; branchId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in to continue" } },
      { status: 401 },
    );
  const { projectId, branchId } = await params;
  try {
    const { universe } = await requireStoryworldBranch(
      session.user.id,
      projectId,
      branchId,
    );
    await prisma.$transaction([
      prisma.canonBranch.updateMany({
        where: { universeId: universe.id, active: true },
        data: { active: false },
      }),
      prisma.canonBranch.update({
        where: { id: branchId },
        data: { active: true },
      }),
    ]);
    return Response.json({ branchId });
  } catch (error) {
    return storyworldError(error);
  }
}
