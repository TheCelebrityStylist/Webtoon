import { prisma } from "@/lib/prisma";

export class AuthorizationError extends Error { readonly status = 403; }
export class ResourceNotFoundError extends Error { readonly status = 404; }
export async function requireWorkspaceRole(userId: string, workspaceId: string, roles?: readonly string[]) {
  const membership = await prisma.workspaceMember.findUnique({ where: { workspaceId_userId: { workspaceId, userId } } });
  if (!membership || (roles && !roles.includes(membership.role))) throw new AuthorizationError("You do not have permission for this workspace.");
  return membership;
}
export async function requireProjectAccess(userId: string, projectId: string, roles?: readonly string[]) {
  const project = await prisma.series.findFirst({ where: { id: projectId, deletedAt: null }, select: { workspaceId: true } });
  if (!project) throw new ResourceNotFoundError("Project not found.");
  await requireWorkspaceRole(userId, project.workspaceId, roles);
  return project;
}
