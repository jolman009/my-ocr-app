import { describe, expect, it } from "vitest";
import { ReceiptExtractor } from "../src/services/receiptExtractor.js";
import type { OcrResult } from "../src/types/receipt.js";

const fixture: OcrResult = {
  rawText: `Cafe Central\n123 Main St\nChicago, IL 60601\n03/06/2026\n2 Latte 9.00\nCroissant 3.25\nSubtotal 12.25\nTax 0.98\nTOTAL 13.23`,
  lines: [
    "Cafe Central",
    "123 Main St",
    "Chicago, IL 60601",
    "03/06/2026",
    "2 Latte 9.00",
    "Croissant 3.25",
    "Subtotal 12.25",
    "Tax 0.98",
    "TOTAL 13.23"
  ],
  blocks: [],
  raw: {}
};

describe("ReceiptExtractor", () => {
  it("extracts common receipt fields", () => {
    const extractor = new ReceiptExtractor();
    const parsed = extractor.parse(fixture);

    expect(parsed.merchantName).toBe("Cafe Central");
    expect(parsed.receiptDate).toBe("2026-03-06");
    expect(parsed.address).toContain("123 Main St");
    expect(parsed.total).toBe(13.23);
    expect(parsed.items).toHaveLength(2);
    expect(parsed.items[0]?.quantity).toBe(2);
  });
});