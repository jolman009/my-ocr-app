import { describe, expect, it } from "vitest";
import { getExportUrl } from "../src/api/client";

describe("getExportUrl", () => {
  it("builds export URLs with filters", () => {
    const url = getExportUrl("csv", { merchant: "Cafe", status: "processed" });
    expect(url).toContain("receipts.csv");
    expect(url).toContain("merchant=Cafe");
    expect(url).toContain("status=processed");
  });
});