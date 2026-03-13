import type { OcrProvider } from "./ocrProvider.js";
import type { OcrResult } from "../types/receipt.js";

const mockText = `CAFE CENTRAL
123 MAIN ST
CHICAGO, IL 60601
03/06/2026
Latte 4.50
Croissant 3.25
Subtotal 7.75
Tax 0.62
Tip 1.55
TOTAL 9.92`;

export class MockOcrProvider implements OcrProvider {
  async extractReceiptText(): Promise<OcrResult> {
    return {
      rawText: mockText,
      lines: mockText.split(/\r?\n/),
      blocks: mockText.split(/\r?\n/).map((text, index) => ({
        text,
        confidence: 0.9,
        type: "line" as const,
        vertices: [
          { x: 0, y: index * 12 },
          { x: 120, y: index * 12 },
          { x: 120, y: index * 12 + 10 },
          { x: 0, y: index * 12 + 10 },
        ],
      })),
      raw: { provider: "mock" },
    };
  }
}
