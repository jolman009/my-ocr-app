/**
 * Pulls the candidate recipient identity off a shipping label's OCR text so the
 * document can be routed to a customer (#18). A forwarding center keys customers
 * by their mailbox / suite number (e.g. "PMB 1234", "Suite 220"), so that's the
 * primary signal; the recipient name is a softer, fuzzy-matched tiebreaker.
 *
 * Both fields are best-effort — OCR on warehouse labels is noisy, and the
 * downstream matcher is responsible for deciding whether a parse is trustworthy.
 */

export interface RecipientExtraction {
  /** Parsed mailbox / suite / box identifier, normalized (uppercased, trimmed). */
  mailboxNumber: string | null;
  /** Best-guess recipient name line, for fuzzy confirmation against customers. */
  recipientName: string | null;
}

// Ordered by how strongly each phrasing implies a forwarding mailbox. PMB
// (Private Mail Box) is the strongest; a bare "#1234" is the weakest fallback
// and only used when nothing more specific matched.
const MAILBOX_RULES: RegExp[] = [
  /\bPMB\s*#?\s*([A-Z0-9-]{1,8})\b/i,
  /\bmailbox\s*#?\s*([A-Z0-9-]{1,8})\b/i,
  /\b(?:suite|ste)\s*#?\s*([A-Z0-9-]{1,8})\b/i,
  /\bunit\s*#?\s*([A-Z0-9-]{1,8})\b/i,
  /\bbox\s*#?\s*([A-Z0-9-]{1,8})\b/i,
  /#\s*([0-9]{2,6})\b/
];

const normalizeMailbox = (value: string): string => value.replace(/\s+/g, "").toUpperCase();

const extractMailboxNumber = (text: string): string | null => {
  for (const rule of MAILBOX_RULES) {
    const match = text.match(rule);
    if (match?.[1]) {
      return normalizeMailbox(match[1]);
    }
  }
  return null;
};

// A line that's plausibly a person/company name: has letters, isn't dominated by
// digits, and isn't an obvious address/label line.
const LABEL_NOISE = /\b(ship\s*to|ship\s*from|tracking|usps|ups|fedex|dhl|po box|suite|ste|pmb|mailbox|unit)\b/i;
// Address tells: a leading house number, a street-type word, or a 5-digit ZIP.
// (Bare "St"/"Dr" abbreviations are intentionally excluded so titles like
// "Dr Maria Garcia" aren't discarded.)
const ADDRESS_HINT = /^\s*\d|\b(street|avenue|boulevard|blvd|road|lane|drive|highway)\b|\b\d{5}(?:-\d{4})?\b/i;
const looksLikeName = (line: string): boolean => {
  const trimmed = line.trim();
  if (trimmed.length < 2 || trimmed.length > 60) return false;
  if (!/[A-Za-z]/.test(trimmed)) return false;
  // Reject lines that are mostly digits (addresses, zips, tracking fragments).
  const digits = (trimmed.match(/\d/g) ?? []).length;
  if (digits > trimmed.replace(/\s/g, "").length / 2) return false;
  if (ADDRESS_HINT.test(trimmed)) return false;
  return !LABEL_NOISE.test(trimmed);
};

const extractRecipientName = (text: string): string | null => {
  const lines = text.split(/\r?\n/);
  const shipToIndex = lines.findIndex((line) => /\bship\s*to\b/i.test(line));

  // Preferred: the first name-like line after a "SHIP TO" marker. Some labels
  // put the name on the same line ("SHIP TO: JANE DOE"); handle that first.
  if (shipToIndex !== -1) {
    const inline = lines[shipToIndex].replace(/.*\bship\s*to\b[:\s]*/i, "").trim();
    if (looksLikeName(inline)) return inline;
    for (let i = shipToIndex + 1; i < Math.min(lines.length, shipToIndex + 4); i += 1) {
      if (looksLikeName(lines[i])) return lines[i].trim();
    }
  }

  return null;
};

export const extractRecipient = (text: string | null | undefined): RecipientExtraction => {
  if (!text || !text.trim()) {
    return { mailboxNumber: null, recipientName: null };
  }
  return {
    mailboxNumber: extractMailboxNumber(text),
    recipientName: extractRecipientName(text)
  };
};
