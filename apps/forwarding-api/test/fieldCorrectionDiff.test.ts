import { describe, it, expect } from "vitest";
import { diffCorrections } from "../src/utils/fieldCorrectionDiff.js";

const baseDoc = {
  trackingNumber: "1Z999",
  carrier: "UPS",
  recipientName: "Jane Doe",
  mailboxNumber: "1234",
  documentType: "label",
  matchedCustomerId: null,
  status: "needs_review",
  // Non-audited fields that must never produce a correction:
  ocrRawText: "raw",
  confidence: 0.4
};

describe("diffCorrections", () => {
  it("records only fields present in the patch that changed", () => {
    const corrections = diffCorrections(baseDoc, {
      trackingNumber: "1Z888",
      status: "processed"
    });
    expect(corrections).toEqual([
      { fieldName: "trackingNumber", oldValue: "1Z999", newValue: "1Z888" },
      { fieldName: "status", oldValue: "needs_review", newValue: "processed" }
    ]);
  });

  it("ignores patched fields whose value is unchanged", () => {
    const corrections = diffCorrections(baseDoc, { carrier: "UPS", status: "processed" });
    expect(corrections).toEqual([
      { fieldName: "status", oldValue: "needs_review", newValue: "processed" }
    ]);
  });

  it("records clearing a field to null", () => {
    const corrections = diffCorrections(baseDoc, { recipientName: null });
    expect(corrections).toEqual([
      { fieldName: "recipientName", oldValue: "Jane Doe", newValue: null }
    ]);
  });

  it("records setting a previously-null field", () => {
    const corrections = diffCorrections(baseDoc, { matchedCustomerId: "cust_1" });
    expect(corrections).toEqual([
      { fieldName: "matchedCustomerId", oldValue: null, newValue: "cust_1" }
    ]);
  });

  it("returns nothing when no audited field is present in the patch", () => {
    expect(diffCorrections(baseDoc, {})).toEqual([]);
  });

  it("never audits non-editable fields even if they appear in the patch", () => {
    // ocrRawText/confidence aren't in AUDITED_FIELDS, so a stray value is ignored.
    expect(diffCorrections(baseDoc, { ocrRawText: "tampered", confidence: 0.9 })).toEqual([]);
  });

  it("preserves the canonical field order regardless of patch key order", () => {
    const corrections = diffCorrections(baseDoc, {
      status: "processed",
      carrier: "FedEx",
      trackingNumber: "1Z000"
    });
    expect(corrections.map((c) => c.fieldName)).toEqual([
      "trackingNumber",
      "carrier",
      "status"
    ]);
  });
});
