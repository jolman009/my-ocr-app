import { describe, expect, it } from "vitest";
import { getExportUrl, setApiBaseUrl } from "@receipt-ocr/shared/api";

describe("getExportUrl", () => {
  it("builds export URLs with filters", () => {
    setApiBaseUrl("http://localhost:4000/api");
    const url = getExportUrl("csv", { merchant: "Cafe", status: "processed" });
    expect(url).toContain("receipts.csv");
    expect(url).toContain("merchant=Cafe");
    expect(url).toContain("status=processed");
  });
});
