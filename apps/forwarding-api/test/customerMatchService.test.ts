import { describe, it, expect } from "vitest";
import type { CustomerAccount } from "@prisma/client";
import { matchCustomer } from "../src/services/customerMatchService.js";

const customer = (id: string, name: string, mailboxNumber: string): CustomerAccount => ({
  id,
  organizationId: "org1",
  name,
  mailboxNumber,
  active: true,
  createdAt: new Date(0),
  updatedAt: new Date(0)
});

const CUSTOMERS = [
  customer("c1", "Acme Corporation", "1234"),
  customer("c2", "Beta Logistics LLC", "220"),
  customer("c3", "Garcia Imports", "A12")
];

describe("matchCustomer", () => {
  it("matches on an exact mailbox number with high confidence", () => {
    const match = matchCustomer(CUSTOMERS, { mailboxNumber: "1234", recipientName: null });
    expect(match?.customerId).toBe("c1");
    expect(match?.matchedBy).toBe("mailbox");
    expect(match?.confidence).toBe(0.9);
  });

  it("bumps confidence when the name corroborates the mailbox", () => {
    const match = matchCustomer(CUSTOMERS, {
      mailboxNumber: "1234",
      recipientName: "Acme Corporation"
    });
    expect(match?.customerId).toBe("c1");
    expect(match?.matchedBy).toBe("mailbox+name");
    expect(match?.confidence).toBe(0.97);
  });

  it("normalizes mailbox casing/spacing before comparing", () => {
    const match = matchCustomer(CUSTOMERS, { mailboxNumber: "a 12", recipientName: null });
    expect(match?.customerId).toBe("c3");
  });

  it("falls back to a fuzzy name match when there's no mailbox", () => {
    const match = matchCustomer(CUSTOMERS, {
      mailboxNumber: null,
      recipientName: "Acme Corp"
    });
    expect(match?.customerId).toBe("c1");
    expect(match?.matchedBy).toBe("name");
    // Name-only confidence stays below the mailbox tier.
    expect(match?.confidence).toBeLessThan(0.9);
    expect(match?.confidence).toBeGreaterThan(0);
  });

  it("returns null when the name is too far from any customer", () => {
    const match = matchCustomer(CUSTOMERS, {
      mailboxNumber: null,
      recipientName: "Zzzz Unrelated Name"
    });
    expect(match).toBeNull();
  });

  it("returns null when an unknown mailbox has no usable name", () => {
    const match = matchCustomer(CUSTOMERS, { mailboxNumber: "9999", recipientName: null });
    expect(match).toBeNull();
  });

  it("returns null when there are no customers", () => {
    expect(matchCustomer([], { mailboxNumber: "1234", recipientName: "Acme" })).toBeNull();
  });

  it("ranks an exact mailbox above a competing fuzzy name", () => {
    // Mailbox points to c2 even though the name looks like c1.
    const match = matchCustomer(CUSTOMERS, {
      mailboxNumber: "220",
      recipientName: "Acme Corporation"
    });
    expect(match?.customerId).toBe("c2");
    expect(match?.matchedBy).toBe("mailbox");
  });
});
