"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { projectInput, characterInput, locationInput, worldRuleInput } from "@/domain/contracts";
import { requireUser } from "@/server/session";
import { requireProjectAccess, requireWorkspaceRole } from "@/server/authorization";
import type { FormState } from "./auth";

const values = (data: FormData) => Object.fromEntries(data.entries());
const slugify = (title: string) => title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export async function createProject(_: FormState, data: FormData): Promise<FormState> {
  const user = await requireUser(); const parsed = projectInput.safeParse(values(data));
  if (!parsed.success) return { error: "Please correct the project details.", fields: parsed.error.flatten().fieldErrors };
  const membership = await prisma.workspaceMember.findFirst({ where: { userId: user.id, role: "OWNER" } });
  if (!membership) return { error: "An owner workspace is required." };
  const project = await prisma.series.create({ data: { ...parsed.data, slug: `${slugify(parsed.data.title)}-${Date.now().toString(36)}`, workspaceId: membership.workspaceId } });
  redirect(`/studio/projects/${project.id}/overview`);
}
export async function updateProject(projectId: string, _: FormState, data: FormData): Promise<FormState> {
  const user = await requireUser(); await requireProjectAccess(user.id, projectId, ["OWNER", "WRITER", "EDITOR"]);
  const parsed = projectInput.safeParse(values(data)); if (!parsed.success) return { error: "Please correct the project details.", fields: parsed.error.flatten().fieldErrors };
  await prisma.series.update({ where: { id: projectId }, data: parsed.data }); revalidatePath(`/studio/projects/${projectId}`); return { success: "Project saved." };
}
export async function deleteProject(projectId: string) {
  const user = await requireUser(); const project = await requireProjectAccess(user.id, projectId, ["OWNER"]); await requireWorkspaceRole(user.id, project.workspaceId, ["OWNER"]);
  await prisma.series.update({ where: { id: projectId }, data: { deletedAt: new Date() } }); redirect("/studio/projects");
}
export async function createLocation(projectId: string, _: FormState, data: FormData): Promise<FormState> {
  const user = await requireUser(); await requireProjectAccess(user.id, projectId, ["OWNER", "WRITER", "EDITOR"]); const parsed = locationInput.safeParse(values(data));
  if (!parsed.success) return { error: "Check the location fields.", fields: parsed.error.flatten().fieldErrors }; await prisma.location.create({ data: { ...parsed.data, seriesId: projectId } }); revalidatePath(`/studio/projects/${projectId}/bible`); return { success: "Location added." };
}
export async function createWorldRule(projectId: string, _: FormState, data: FormData): Promise<FormState> {
  const user = await requireUser(); await requireProjectAccess(user.id, projectId, ["OWNER", "WRITER", "EDITOR"]); const parsed = worldRuleInput.safeParse(values(data));
  if (!parsed.success) return { error: "Check the world rule fields.", fields: parsed.error.flatten().fieldErrors }; await prisma.worldRule.create({ data: { ...parsed.data, seriesId: projectId } }); revalidatePath(`/studio/projects/${projectId}/bible`); return { success: "World rule added." };
}
export async function createCharacter(projectId: string, _: FormState, data: FormData): Promise<FormState> {
  const user = await requireUser(); await requireProjectAccess(user.id, projectId, ["OWNER", "WRITER", "EDITOR"]); const parsed = characterInput.safeParse(values(data));
  if (!parsed.success) return { error: "Check the character fields.", fields: parsed.error.flatten().fieldErrors };
  if (parsed.data.locationId && !(await prisma.location.findFirst({ where: { id: parsed.data.locationId, seriesId: projectId, deletedAt: null } }))) return { error: "The selected location does not belong to this project." };
  await prisma.character.create({ data: { ...parsed.data, locationId: parsed.data.locationId || null, seriesId: projectId } }); revalidatePath(`/studio/projects/${projectId}/bible`); return { success: "Character added." };
}
export async function updateCharacter(projectId: string, characterId: string, _: FormState, data: FormData): Promise<FormState> {
  const user = await requireUser(); await requireProjectAccess(user.id, projectId, ["OWNER", "WRITER", "EDITOR"]); const parsed = characterInput.safeParse(values(data));
  if (!parsed.success) return { error: "Check the character fields.", fields: parsed.error.flatten().fieldErrors };
  if (!(await prisma.character.findFirst({ where: { id: characterId, seriesId: projectId, deletedAt: null } }))) return { error: "Character not found in this project." };
  if (parsed.data.locationId && !(await prisma.location.findFirst({ where: { id: parsed.data.locationId, seriesId: projectId, deletedAt: null } }))) return { error: "The selected location does not belong to this project." };
  await prisma.character.update({ where: { id: characterId }, data: { ...parsed.data, locationId: parsed.data.locationId || null } }); revalidatePath(`/studio/projects/${projectId}/bible`); return { success: "Character saved." };
}
