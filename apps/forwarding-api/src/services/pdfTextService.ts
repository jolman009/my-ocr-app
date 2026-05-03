import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";

const require = createRequire(import.meta.url);
GlobalWorkerOptions.workerSrc = pathToFileURL(
  require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs")
).href;

export interface PdfExtractResult {
  text: string;
  pageCount: number;
  hasEmbeddedText: boolean;
}

export class PdfTextService {
  async extractText(buffer: Buffer): Promise<PdfExtractResult> {
    const pdf = await getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      disableFontFace: true
    }).promise;

    const pageTexts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      pageTexts.push(pageText);
    }

    const text = pageTexts.join("\n\n").trim();
    return {
      text,
      pageCount: pdf.numPages,
      hasEmbeddedText: text.length > 0
    };
  }
}
