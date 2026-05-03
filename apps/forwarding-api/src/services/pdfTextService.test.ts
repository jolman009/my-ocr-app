import { describe, it, expect, beforeAll } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { PdfTextService } from "./pdfTextService.js";

async function createPdfWithText(text: string): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([400, 200]);
  page.drawText(text, { x: 50, y: 100, size: 12, font });
  return Buffer.from(await doc.save());
}

async function createEmptyPdf(): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.addPage([400, 200]);
  return Buffer.from(await doc.save());
}

describe("PdfTextService", () => {
  const service = new PdfTextService();

  let textPdf: Buffer;
  let emptyPdf: Buffer;

  beforeAll(async () => {
    textPdf = await createPdfWithText("UPS tracking number 1Z999AA10123456784");
    emptyPdf = await createEmptyPdf();
  });

  it("extracts embedded text from a born-digital PDF", async () => {
    const result = await service.extractText(textPdf);

    expect(result.hasEmbeddedText).toBe(true);
    expect(result.pageCount).toBe(1);
    expect(result.text).toContain("1Z999AA10123456784");
  });

  it("returns hasEmbeddedText:false for a PDF with no text content", async () => {
    const result = await service.extractText(emptyPdf);

    expect(result.hasEmbeddedText).toBe(false);
    expect(result.pageCount).toBe(1);
    expect(result.text).toBe("");
  });
});
