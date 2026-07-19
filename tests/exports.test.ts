import { describe, expect, it } from "vitest";
import { createDocx, createPdf, exportChecksum, manuscriptPlainText } from "@/lib/exports/manuscript";

const book = { title: "The Glass Orchard", author: "A. Writer", premise: "Memory has a price.", chapters: [{ number: 1, title: "Ash", scenes: [{ title: "The Gate", manuscriptText: "Mara opened the gate.\n\nThe orchard remembered." }] }] };

describe("production manuscript exports", () => {
  it("keeps story structure in plain text", () => {
    const text = manuscriptPlainText(book);
    expect(text).toContain("CHAPTER 1: Ash");
    expect(text).toContain("The orchard remembered.");
  });

  it("creates a valid DOCX archive", async () => {
    const bytes = await createDocx(book);
    expect(bytes.subarray(0, 2).toString()).toBe("PK");
    expect(exportChecksum(bytes)).toHaveLength(64);
  });

  it("creates a valid PDF", async () => {
    const bytes = await createPdf(book);
    expect(new TextDecoder().decode(bytes.subarray(0, 5))).toBe("%PDF-");
    expect(exportChecksum(bytes)).toHaveLength(64);
  });
});
