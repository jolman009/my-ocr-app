/**
 * Classifies a forwarding-center document into a coarse type from its OCR /
 * embedded text, using weighted keyword rules. This is a cheap first pass that
 * feeds routing and the human review queue (#19) — it is intentionally rules +
 * keywords, not ML. The printed text on logistics paperwork is formulaic enough
 * that a handful of strong phrases ("commercial invoice", "packing slip",
 * "amount due") separate the common types reliably.
 *
 * Returns the highest-scoring type plus a confidence in [0, 1] derived from both
 * the magnitude of the winning score and its separation from the runner-up, so a
 * document that matches one type's keywords decisively scores higher than one
 * that trips keywords across several types.
 */

export type DocumentType = "label" | "invoice" | "packing_slip" | "customs" | "unknown";

export interface DocumentClassification {
  type: DocumentType;
  confidence: number;
}

export interface ClassifyOptions {
  /**
   * Set when an upstream step already decoded a carrier tracking number
   * (barcode or regex). It's a strong signal the document is a shipping label,
   * so it adds weight to the "label" score.
   */
  hasCarrierTracking?: boolean;
}

interface KeywordRule {
  /** Lower-cased phrase matched as a whole-word(s) substring. */
  phrase: string;
  weight: number;
}

// Phrases are matched case-insensitively with word boundaries so "invoice"
// doesn't fire inside "invoiced" mid-word noise, while multi-word phrases like
// "ship to" still match. Strong, type-defining phrases carry more weight than
// generic ones that can appear on several document types.
const RULES: Record<Exclude<DocumentType, "unknown">, KeywordRule[]> = {
  customs: [
    { phrase: "commercial invoice", weight: 4 },
    { phrase: "customs", weight: 3 },
    { phrase: "harmonized", weight: 3 },
    { phrase: "hs code", weight: 3 },
    { phrase: "cn22", weight: 3 },
    { phrase: "cn23", weight: 3 },
    { phrase: "country of origin", weight: 2 },
    { phrase: "incoterms", weight: 2 },
    { phrase: "tariff", weight: 2 },
    { phrase: "duties", weight: 2 },
    { phrase: "declaration", weight: 1 }
  ],
  invoice: [
    { phrase: "amount due", weight: 3 },
    { phrase: "total due", weight: 3 },
    { phrase: "balance due", weight: 3 },
    { phrase: "bill to", weight: 2 },
    { phrase: "invoice", weight: 2 },
    { phrase: "subtotal", weight: 2 },
    { phrase: "remit", weight: 2 },
    { phrase: "payment terms", weight: 2 },
    { phrase: "net 30", weight: 2 },
    { phrase: "net 15", weight: 2 },
    { phrase: "unit price", weight: 1 },
    { phrase: "purchase order", weight: 1 }
  ],
  packing_slip: [
    { phrase: "packing slip", weight: 4 },
    { phrase: "packing list", weight: 4 },
    { phrase: "pick list", weight: 2 },
    { phrase: "qty shipped", weight: 2 },
    { phrase: "quantity shipped", weight: 2 },
    { phrase: "items shipped", weight: 2 },
    { phrase: "no charge", weight: 1 },
    { phrase: "order number", weight: 1 }
  ],
  label: [
    { phrase: "ship to", weight: 2 },
    { phrase: "tracking", weight: 2 },
    { phrase: "ups", weight: 2 },
    { phrase: "fedex", weight: 2 },
    { phrase: "usps", weight: 2 },
    { phrase: "dhl", weight: 2 },
    { phrase: "ship from", weight: 1 },
    { phrase: "priority mail", weight: 1 },
    { phrase: "next day air", weight: 1 },
    { phrase: "ground", weight: 1 },
    { phrase: "express", weight: 1 }
  ]
};

const CARRIER_TRACKING_BOOST = 3;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Match the phrase with boundaries on each side so "ups" matches "UPS GROUND"
// but not "groups". Non-alphanumeric boundaries keep multi-word phrases intact.
const phraseMatches = (haystack: string, phrase: string): boolean =>
  new RegExp(`(?<![a-z0-9])${escapeRegExp(phrase)}(?![a-z0-9])`).test(haystack);

const scoreType = (text: string, rules: KeywordRule[]): number =>
  rules.reduce((score, rule) => (phraseMatches(text, rule.phrase) ? score + rule.weight : score), 0);

export const classifyDocument = (
  text: string | null | undefined,
  options: ClassifyOptions = {}
): DocumentClassification => {
  if (!text || !text.trim()) {
    return { type: "unknown", confidence: 0 };
  }

  const haystack = text.toLowerCase();

  const scores = (Object.keys(RULES) as Array<Exclude<DocumentType, "unknown">>).map((type) => {
    let score = scoreType(haystack, RULES[type]);
    if (type === "label" && options.hasCarrierTracking) {
      score += CARRIER_TRACKING_BOOST;
    }
    return { type, score };
  });

  scores.sort((a, b) => b.score - a.score);
  const [top, runnerUp] = scores;

  if (top.score === 0) {
    return { type: "unknown", confidence: 0 };
  }

  // Confidence blends how strongly the winner matched (magnitude, saturating at
  // a score of 4) with how clearly it beat the runner-up (separation). A lone
  // strong match and a decisive win both read as confident; a near-tie does not.
  const runnerUpScore = runnerUp?.score ?? 0;
  const magnitude = Math.min(1, top.score / 4);
  const separation = top.score + runnerUpScore === 0 ? 0 : (top.score - runnerUpScore) / (top.score + runnerUpScore);
  const confidence = Math.round((0.5 * magnitude + 0.5 * separation) * 100) / 100;

  return { type: top.type, confidence };
};
