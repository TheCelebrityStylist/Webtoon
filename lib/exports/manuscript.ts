import { createHash } from "node:crypto";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type ExportScene = { title: string; manuscriptText: string };
export type ExportChapter = { number: number; title: string; scenes: ExportScene[] };
export type ExportManuscript = {
  title: string;
  author?: string | null;
  premise?: string | null;
  chapters: ExportChapter[];
};

export function manuscriptPlainText(book: ExportManuscript) {
  return [
    book.title,
    book.author ? `by ${book.author}` : "",
    book.premise ?? "",
    ...book.chapters.flatMap((chapter) => [
      `CHAPTER ${chapter.number}: ${chapter.title}`,
      ...chapter.scenes.flatMap((scene) => [scene.title, scene.manuscriptText]),
    ]),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function exportChecksum(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

export async function createDocx(book: ExportManuscript) {
  const children: Paragraph[] = [
    new Paragraph({ text: book.title, heading: HeadingLevel.TITLE }),
    ...(book.author ? [new Paragraph({ children: [new TextRun({ text: `by ${book.author}`, italics: true })] })] : []),
    ...(book.premise ? [new Paragraph({ text: book.premise })] : []),
  ];

  for (const chapter of book.chapters) {
    children.push(new Paragraph({ text: `Chapter ${chapter.number}: ${chapter.title}`, heading: HeadingLevel.HEADING_1, pageBreakBefore: true }));
    for (const scene of chapter.scenes) {
      children.push(new Paragraph({ text: scene.title, heading: HeadingLevel.HEADING_2 }));
      for (const paragraph of scene.manuscriptText.split(/\n\s*\n/)) {
        children.push(new Paragraph({ text: paragraph.trim() }));
      }
    }
  }

  return Packer.toBuffer(new Document({ sections: [{ properties: {}, children }] }));
}

function wrap(text: string, max = 88) {
  const lines: string[] = [];
  for (const raw of text.split("\n")) {
    const words = raw.split(/\s+/).filter(Boolean);
    let line = "";
    for (const word of words) {
      if (`${line} ${word}`.trim().length > max && line) {
        lines.push(line);
        line = word;
      } else line = `${line} ${word}`.trim();
    }
    lines.push(line);
  }
  return lines;
}

export async function createPdf(book: ExportManuscript) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const width = 612;
  const height = 792;
  const margin = 64;
  let page = pdf.addPage([width, height]);
  let y = height - margin;

  const write = (text: string, size = 11, isBold = false, gap = 7) => {
    for (const line of wrap(text, size >= 16 ? 52 : 88)) {
      if (y < margin + size) {
        page = pdf.addPage([width, height]);
        y = height - margin;
      }
      page.drawText(line, { x: margin, y, size, font: isBold ? bold : regular, color: rgb(0.12, 0.1, 0.09) });
      y -= size + gap;
    }
  };

  write(book.title, 24, true, 10);
  if (book.author) write(`by ${book.author}`, 12, false, 10);
  if (book.premise) write(book.premise, 11, false, 8);
  for (const chapter of book.chapters) {
    y -= 18;
    write(`CHAPTER ${chapter.number}: ${chapter.title}`, 17, true, 10);
    for (const scene of chapter.scenes) {
      write(scene.title, 13, true, 8);
      for (const paragraph of scene.manuscriptText.split(/\n\s*\n/)) write(paragraph.trim(), 11, false, 7);
      y -= 8;
    }
  }
  pdf.setTitle(book.title);
  if (book.author) pdf.setAuthor(book.author);
  pdf.setCreator("Morrow");
  return pdf.save();
}
