import type { ManuscriptDocument, ManuscriptNode } from "./types";

const blockTypes = new Set(["paragraph", "heading", "blockquote", "codeBlock", "bulletList", "orderedList", "listItem", "horizontalRule"]);

export function manuscriptFromText(text: string, prefix = "block"): ManuscriptDocument {
  const paragraphs = text.split(/\n\s*\n/);
  return {
    type: "doc",
    content: paragraphs.map((paragraph, index) => ({
      type: "paragraph",
      attrs: { blockId: `${prefix}-${index}` },
      content: paragraph ? [{ type: "text", text: paragraph }] : undefined,
    })),
  };
}

export function manuscriptText(document: ManuscriptDocument): string {
  const read = (node: ManuscriptNode): string => {
    if (node.type === "text") return node.text ?? "";
    if (node.type === "hardBreak") return "\n";
    if (node.type === "horizontalRule") return "\n---\n";
    const children = (node.content ?? []).map(read);
    if (node.type === "listItem") return children.join("").trim();
    if (node.type === "bulletList") return children.map((value) => `• ${value}`).join("\n");
    if (node.type === "orderedList") return children.map((value, index) => `${index + 1}. ${value}`).join("\n");
    return children.join("");
  };

  return (document.content ?? [])
    .map((node) => read(node).trimEnd())
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeManuscript(document: unknown, fallbackText = "", prefix = "block"): ManuscriptDocument {
  if (!document || typeof document !== "object" || (document as { type?: unknown }).type !== "doc") return manuscriptFromText(fallbackText, prefix);
  const clone = structuredClone(document) as ManuscriptDocument;
  let index = 0;
  const visit = (node: ManuscriptNode) => {
    if (blockTypes.has(node.type) && node.type !== "doc") {
      node.attrs = { ...(node.attrs ?? {}), blockId: String(node.attrs?.blockId ?? `${prefix}-${index++}`) };
    }
    node.content?.forEach(visit);
  };
  visit(clone);
  return clone;
}

export function manuscriptWordCount(document: ManuscriptDocument) {
  return manuscriptText(document).split(/\s+/).filter(Boolean).length;
}
