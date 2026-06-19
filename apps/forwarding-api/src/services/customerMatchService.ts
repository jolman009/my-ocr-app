import Fuse from "fuse.js";
import type { CustomerAccount } from "@prisma/client";
import type { CustomerAccountRepository } from "../repositories/customerAccountRepository.js";
import type { RecipientExtraction } from "../utils/recipientExtractor.js";

export type CustomerMatchBasis = "mailbox" | "mailbox+name" | "name";

export interface CustomerMatch {
  customerId: string;
  confidence: number;
  matchedBy: CustomerMatchBasis;
}

// fuse.js scores run 0 (perfect) → 1 (no match). A name only counts as a match
// at or below this score; anything fuzzier is treated as "no confident match"
// and the document is left for the review queue (#19) instead of mis-routed.
const NAME_SCORE_THRESHOLD = 0.4;

const MAILBOX_CONFIDENCE = 0.9;
const MAILBOX_PLUS_NAME_CONFIDENCE = 0.97;

const normalizeMailbox = (value: string): string => value.replace(/\s+/g, "").toUpperCase();

const buildNameIndex = (customers: CustomerAccount[]): Fuse<CustomerAccount> =>
  new Fuse(customers, { keys: ["name"], includeScore: true, threshold: NAME_SCORE_THRESHOLD });

/**
 * Pure matching logic — no DB. Given an org's candidate customers and what was
 * parsed off the label, decide which customer (if any) the document belongs to.
 *
 * Mailbox number is the trusted key: an exact hit is a high-confidence match,
 * bumped higher when the recipient name also agrees. With no mailbox, fall back
 * to a fuzzy name match at lower confidence.
 */
export const matchCustomer = (
  customers: CustomerAccount[],
  extraction: RecipientExtraction
): CustomerMatch | null => {
  if (customers.length === 0) return null;

  if (extraction.mailboxNumber) {
    const target = normalizeMailbox(extraction.mailboxNumber);
    const byMailbox = customers.find((c) => normalizeMailbox(c.mailboxNumber) === target);
    if (byMailbox) {
      // If we also have a name, see whether it corroborates the mailbox hit.
      let confidence = MAILBOX_CONFIDENCE;
      let matchedBy: CustomerMatchBasis = "mailbox";
      if (extraction.recipientName) {
        const nameHit = buildNameIndex([byMailbox]).search(extraction.recipientName)[0];
        if (nameHit && (nameHit.score ?? 1) <= NAME_SCORE_THRESHOLD) {
          confidence = MAILBOX_PLUS_NAME_CONFIDENCE;
          matchedBy = "mailbox+name";
        }
      }
      return { customerId: byMailbox.id, confidence, matchedBy };
    }
  }

  // No mailbox (or it matched nobody) — fall back to fuzzy name matching.
  if (extraction.recipientName) {
    const hit = buildNameIndex(customers).search(extraction.recipientName)[0];
    if (hit && (hit.score ?? 1) <= NAME_SCORE_THRESHOLD) {
      // Map fuse score (0 best) to a confidence kept below the mailbox tier so a
      // name-only match never outranks an exact mailbox match.
      const confidence = Math.round((0.85 - (hit.score ?? 0) * 0.875) * 100) / 100;
      return { customerId: hit.item.id, confidence, matchedBy: "name" };
    }
  }

  return null;
};

export class CustomerMatchService {
  constructor(private readonly repository: CustomerAccountRepository) {}

  /** Loads the org's active customers and matches the parsed recipient. */
  async match(organizationId: string, extraction: RecipientExtraction): Promise<CustomerMatch | null> {
    if (!extraction.mailboxNumber && !extraction.recipientName) {
      return null;
    }
    const customers = await this.repository.listActiveForMatching(organizationId);
    return matchCustomer(customers, extraction);
  }
}
