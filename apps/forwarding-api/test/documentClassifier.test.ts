import { describe, it, expect } from "vitest";
import { classifyDocument } from "../src/utils/documentClassifier.js";

describe("classifyDocument", () => {
  it("classifies a shipping label", () => {
    const text = "SHIP TO\nJOHN SMITH\nUPS GROUND\nTRACKING 1Z999AA10123456784\nNEXT DAY AIR";
    const result = classifyDocument(text);
    expect(result.type).toBe("label");
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it("classifies a commercial invoice as customs, not invoice", () => {
    // "commercial invoice" is the defining phrase for customs paperwork even
    // though it contains the word "invoice".
    const text = "COMMERCIAL INVOICE\nCountry of Origin: USA\nHS Code 8471.30\nIncoterms: DAP";
    const result = classifyDocument(text);
    expect(result.type).toBe("customs");
  });

  it("classifies a vendor invoice", () => {
    const text = "INVOICE #4471\nBILL TO: Acme Corp\nSubtotal $120.00\nAmount Due $132.00\nNet 30";
    const result = classifyDocument(text);
    expect(result.type).toBe("invoice");
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it("classifies a packing slip", () => {
    const text = "PACKING SLIP\nOrder Number 5582\nQty Shipped 3\nItems Shipped: widgets";
    const result = classifyDocument(text);
    expect(result.type).toBe("packing_slip");
  });

  it("uses the carrier-tracking signal to boost a sparse label", () => {
    // Minimal text with no label keywords — the resolved tracking number is what
    // tips it to "label".
    const text = "SHIP TO John";
    const withTracking = classifyDocument(text, { hasCarrierTracking: true });
    expect(withTracking.type).toBe("label");
  });

  it("returns unknown for text with no recognizable keywords", () => {
    const result = classifyDocument("just some random unrelated words here");
    expect(result.type).toBe("unknown");
    expect(result.confidence).toBe(0);
  });

  it("returns unknown for empty input", () => {
    expect(classifyDocument("").type).toBe("unknown");
    expect(classifyDocument(null).type).toBe("unknown");
    expect(classifyDocument(undefined).type).toBe("unknown");
  });

  it("does not match keywords mid-word", () => {
    // "ups" must not fire inside "groups"; "invoice" alone shouldn't dominate
    // generic prose. No whole-word keyword hits -> unknown.
    const result = classifyDocument("our groups discussed several topics today");
    expect(result.type).toBe("unknown");
  });

  it("scores a decisive single-type match more confidently than a mixed one", () => {
    const decisive = classifyDocument("PACKING SLIP\nPACKING LIST\nPick List");
    const mixed = classifyDocument("invoice ship to packing slip customs");
    expect(decisive.confidence).toBeGreaterThan(mixed.confidence);
  });
});
