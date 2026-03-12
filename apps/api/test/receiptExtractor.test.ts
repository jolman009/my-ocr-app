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

  it("extracts fragmented and poorly grouped OCR text", () => {
    const fragmentedFixture: OcrResult = {
      rawText: "WALMART SUPERCENTER\nSome random noise\n11/12/24\nApples\n$ 1.99\nBananas 3x\n$3.00\nGRAND TOTAL\n4.99",
      lines: [
        "WALMART SUPERCENTER", "Some random noise", "11/12/24", "Apples $ 1.99", "Bananas 3x $3.00", "GRAND TOTAL", "4.99"
      ],
      blocks: [],
      raw: {}
    };
    const parsed = new ReceiptExtractor().parse(fragmentedFixture);
    expect(parsed.merchantName).toBe("WALMART SUPERCENTER");
    expect(parsed.receiptDate).toBe("2024-11-12");
    expect(parsed.total).toBe(4.99);
    expect(parsed.items).toHaveLength(2);
    expect(parsed.items[1]?.quantity).toBe(3);
  });

  it("gracefully falls back when totals lack clear keywords", () => {
    const fallbackFixture: OcrResult = {
      rawText: "Mcdonalds\nBurger 5.00\nFries 3.00\n8.00\nThank you for visiting\n",
      lines: [
        "Mcdonalds", "Burger 5.00", "Fries 3.00", "8.00", "Thank you for visiting"
      ],
      blocks: [],
      raw: {}
    };
    const parsed = new ReceiptExtractor().parse(fallbackFixture);
    expect(parsed.merchantName).toBe("Mcdonalds");
    expect(parsed.total).toBe(8.00); // Should pick the max value at the bottom half
    expect(parsed.items).toHaveLength(2);
  });
});