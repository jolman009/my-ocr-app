import { describe, it, expect, vi } from "vitest";
import { ExportService } from "../src/services/exportService.js";
import { ReceiptRepository } from "../src/repositories/receiptRepository.js";
import type { ReceiptRecord } from "../src/types/receipt.js";

// Mock ReceiptRepository
vi.mock("../src/repositories/receiptRepository.js");

const mockReceipt: ReceiptRecord = {
  id: "receipt-123",
  imageUrl: "/uploads/image.png",
  merchantName: "Coffee Shop",
  receiptDate: "2023-10-25",
  address: "123 Main St",
  subtotal: 10.0,
  tax: 1.0,
  tip: 2.0,
  total: 13.0,
  currency: "USD",
  category: null,
  status: "processed",
  confidence: {},
  rawText: "raw ocr text",
  createdAt: "2023-10-25T12:00:00Z",
  updatedAt: "2023-10-25T12:00:00Z",
  items: [
    { name: "Coffee", quantity: 1, unitPrice: 5.0, totalPrice: 5.0 },
    { name: "Sandwich", quantity: 1, unitPrice: 5.0, totalPrice: 5.0 }
  ]
};

describe("ExportService", () => {
  it("should generate a valid CSV string representing the receipt ledger", async () => {
    const mockRepo = new ReceiptRepository() as vi.Mocked<ReceiptRepository>;
    mockRepo.findForExport = vi.fn().mockResolvedValue([mockReceipt]);

    const service = new ExportService(mockRepo);
    const csv = await service.generateCsv({});

    expect(csv).toContain("receipt-123");
    expect(csv).toContain("Coffee Shop");
    expect(csv).toContain("13"); // Total
    expect(csv).toContain("2"); // item_count
    
    // Check that column headers exist
    expect(csv).toContain("merchant_name");
    expect(csv).toContain("item_count");
  });
});
