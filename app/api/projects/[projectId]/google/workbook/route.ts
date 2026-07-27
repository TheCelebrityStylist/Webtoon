import { auth } from "@/auth";
import { buildStoryWorkbook } from "@/lib/google/story-docs";
import { googleErrorResponse, googleJson } from "@/integrations/google/client";
import { prisma } from "@/lib/prisma";
import { serializeWorkspace, workspaceInclude } from "@/lib/story-canvas/server-serializer";
import { requireProjectAccess } from "@/server/authorization";

export async function POST(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId } = await params;
  try {
    await requireProjectAccess(session.user.id, projectId, ["OWNER", "WRITER", "EDITOR"]);
    const project = await prisma.series.findUnique({ where: { id: projectId }, include: workspaceInclude });
    if (!project) return Response.json({ error: "Project not found" }, { status: 404 });
    const canvas = serializeWorkspace(project);
    const workbook = buildStoryWorkbook(canvas.project, canvas.entities);
    let reference = await prisma.googleDocumentReference.findFirst({
      where: { userId: session.user.id, seriesId: projectId, kind: "STORY_WORKBOOK" },
    });
    let spreadsheetId = reference?.googleId;
    if (!reference || !spreadsheetId) {
      const created = await googleJson<{ spreadsheetId: string; spreadsheetUrl: string }>(
        session.user.id,
        "https://www.googleapis.com/auth/spreadsheets",
        "https://sheets.googleapis.com/v4/spreadsheets",
        {
          method: "POST",
          body: JSON.stringify({
            properties: { title: `${project.title} — Story Workbook` },
            sheets: Object.keys(workbook).map((title) => ({ properties: { title } })),
          }),
        },
      );
      spreadsheetId = created.spreadsheetId;
      reference = await prisma.googleDocumentReference.create({
        data: {
          userId: session.user.id,
          seriesId: projectId,
          googleId: spreadsheetId,
          kind: "STORY_WORKBOOK",
          title: `${project.title} — Story Workbook`,
          documentUrl: created.spreadsheetUrl,
          syncStatus: "CONNECTED",
        },
      });
    }
    const data = Object.entries(workbook).map(([range, values]) => ({ range: `'${range}'!A1`, values }));
    await googleJson(
      session.user.id,
      "https://www.googleapis.com/auth/spreadsheets",
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values:batchUpdate`,
      { method: "POST", body: JSON.stringify({ valueInputOption: "RAW", data }) },
    );
    await prisma.googleDocumentReference.update({
      where: { id: reference.id },
      data: { lastSyncedAt: new Date(), syncStatus: "SYNCED" },
    });
    return Response.json({
      workbookId: spreadsheetId,
      workbookUrl: reference.documentUrl,
      sheets: Object.keys(workbook),
      status: "synced",
    });
  } catch (error) {
    return googleErrorResponse(error);
  }
}
