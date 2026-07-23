import { z } from "zod";
import { auth } from "@/auth";
import { googleErrorResponse, googleJson } from "@/integrations/google/client";
import { requireProjectAccess } from "@/server/authorization";
import { parseGoogleDocument } from "@/lib/google/story-docs";
const input = z.object({ documentId: z.string().min(10), interpretation: z.object({ heading1: z.enum(["part", "chapter"]), heading2: z.enum(["chapter", "scene"]), heading3: z.literal("scene"), splitRules: z.boolean() }).optional() });
type Doc = { title: string; revisionId?: string; body?: { content?: Array<{ paragraph?: { paragraphStyle?: { namedStyleType?: string }; elements?: Array<{ textRun?: { content?: string } }> }; sectionBreak?: unknown }> } };
type Block = { text: string; style?: string; kind?: "rule" };
export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth(); if (!session?.user?.id) return Response.json({ error: "Sign in to continue" }, { status: 401 }); const { projectId } = await params;
  try { await requireProjectAccess(session.user.id, projectId, ["OWNER", "WRITER", "EDITOR"]); const parsed = input.safeParse(await request.json()); if (!parsed.success) return Response.json({ error: "Choose a Google Doc" }, { status: 400 });
    const doc = await googleJson<Doc>(session.user.id, "https://www.googleapis.com/auth/documents", `https://docs.googleapis.com/v1/documents/${encodeURIComponent(parsed.data.documentId)}`);
    const blocks = (doc.body?.content ?? []).reduce<Block[]>((result, item) => { const paragraph = item.paragraph; if (!paragraph) { if (item.sectionBreak) result.push({ text: "---", kind: "rule" }); return result; } const text = (paragraph.elements ?? []).map((element) => element.textRun?.content ?? "").join("").trim(); if (text) result.push({ text, style: paragraph.paragraphStyle?.namedStyleType ?? "NORMAL_TEXT" }); return result; }, []);
    return Response.json({ ...parseGoogleDocument(parsed.data.documentId, doc.title, blocks, parsed.data.interpretation), sourceRevisionId: doc.revisionId });
  } catch (error) { return googleErrorResponse(error); }
}
