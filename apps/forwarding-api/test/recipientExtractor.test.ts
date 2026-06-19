import { describe, it, expect } from "vitest";
import { extractRecipient } from "../src/utils/recipientExtractor.js";

describe("extractRecipient — mailbox number", () => {
  it("parses a PMB number", () => {
    expect(extractRecipient("SHIP TO\nJane Doe\nPMB 1234\n123 Main St").mailboxNumber).toBe("1234");
  });

  it("parses a suite number", () => {
    expect(extractRecipient("Acme Corp\nSuite 220\nMiami FL").mailboxNumber).toBe("220");
  });

  it("parses a mailbox number with a hash", () => {
    expect(extractRecipient("MAILBOX #A12").mailboxNumber).toBe("A12");
  });

  it("normalizes to uppercase without spaces", () => {
    expect(extractRecipient("pmb a12").mailboxNumber).toBe("A12");
  });

  it("falls back to a bare #number when nothing more specific matches", () => {
    expect(extractRecipient("John Smith\n#4567\nCity").mailboxNumber).toBe("4567");
  });

  it("prefers PMB over a bare # elsewhere in the text", () => {
    expect(extractRecipient("Order #99\nPMB 1234").mailboxNumber).toBe("1234");
  });

  it("returns null when there's no mailbox", () => {
    expect(extractRecipient("Just some text with no box").mailboxNumber).toBeNull();
  });

  it("returns nulls for empty input", () => {
    expect(extractRecipient("")).toEqual({ mailboxNumber: null, recipientName: null });
    expect(extractRecipient(null)).toEqual({ mailboxNumber: null, recipientName: null });
  });
});

describe("extractRecipient — recipient name", () => {
  it("reads the line after SHIP TO", () => {
    expect(extractRecipient("SHIP TO\nJane Doe\nPMB 1234").recipientName).toBe("Jane Doe");
  });

  it("reads an inline SHIP TO: name", () => {
    expect(extractRecipient("SHIP TO: John Smith\n123 Main St").recipientName).toBe("John Smith");
  });

  it("skips number-dominated lines when picking a name", () => {
    // The line right after SHIP TO is an address; the name is the next line.
    const result = extractRecipient("SHIP TO\n123 Main Street 90210\nMaria Garcia\nPMB 7");
    expect(result.recipientName).toBe("Maria Garcia");
  });

  it("returns null when there's no SHIP TO marker", () => {
    expect(extractRecipient("Random label text\nPMB 1234").recipientName).toBeNull();
  });
});
