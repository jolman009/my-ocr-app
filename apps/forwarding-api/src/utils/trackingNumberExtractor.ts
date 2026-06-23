/**
 * Extracts a likely shipping tracking number + carrier from either a decoded
 * barcode payload (preferred) or freeform OCR text (fallback).
 *
 * Patterns tuned for the major US carriers seen at the forwarding center:
 * UPS, USPS, FedEx, DHL, and Amazon Logistics. Barcodes are always more
 * reliable than OCR when present.
 *
 * Field-hardening notes (2026-06-23, from a real 9-package operator test):
 *   - USPS labels print a GS1 "ship-to ZIP" *routing* barcode — "420" + ZIP —
 *     that is 12 digits and IDENTICAL for every package headed to the same ZIP.
 *     It was being read as a FedEx tracking number (also 12 digits) at high
 *     confidence and then colliding as a false duplicate. We now reject it.
 *   - The real USPS Intelligent Mail barcode (IMpb) is often concatenated after
 *     that routing segment, separated by a GS (0x1d) control char. We strip the
 *     routing prefix + control chars to recover the IMpb.
 *   - Amazon Logistics ("TBA" + 12 digits) had no rule at all.
 *   - USPS IMpb prefixes/lengths were too narrow (missed 96-prefixed and the
 *     longer 26/30/34-digit forms).
 */

export type DetectedCarrier = "UPS" | "FedEx" | "USPS" | "DHL" | "Amazon";

export interface TrackingExtraction {
  trackingNumber: string;
  carrier: DetectedCarrier;
}

interface CarrierRule {
  carrier: DetectedCarrier;
  pattern: RegExp;
  validate?: (match: string) => boolean;
}

// Strip spaces/hyphens inside a candidate before validating — real labels
// often print "1Z 9999 9999 9999 9999" with spaces that OCR preserves.
const normalize = (value: string) => value.replace(/[\s-]/g, "").toUpperCase();

// Drop GS1 group separators (0x1d) and any other control chars that sit between
// concatenated barcode segments. Done by char code to avoid control-char
// literals in the source.
const stripControlChars = (value: string) =>
  Array.from(value)
    .filter((ch) => ch.charCodeAt(0) >= 32)
    .join("");

// A bare USPS "420"+ZIP routing barcode must never be treated as a tracking
// number: it repeats across every package to the same ZIP. FedEx tracking is
// also 12 digits, so this guard is what stops the false FedEx/duplicate match.
const isUspsRoutingPrefix = (digits: string) => /^420\d{5}/.test(digits);

/**
 * USPS labels prefix the Intelligent Mail barcode with a GS1 ship-to-ZIP
 * routing segment ("420" + ZIP5 or ZIP+4), sometimes followed by a control-char
 * separator before the real IMpb. When a plausible IMpb (starts with 9) follows
 * the routing segment, return just the IMpb; otherwise return the input
 * unchanged (a bare routing code stays a routing code and matches nothing).
 */
const stripUspsRoutingPrefix = (digits: string): string => {
  const match = digits.match(/^420(?:\d{9}|\d{5})(9\d{17,})$/);
  return match ? match[1] : digits;
};

// USPS IMpb: all digits, starts with 9, 18–34 long. Covers the canonical
// 22/26/30/34-digit forms plus shorter routing-stripped device reads. Distinct
// from FedEx (exactly 12/15) and DHL (exactly 10), so no length collision.
const isUspsImpb = (digits: string) => /^9\d{17,33}$/.test(digits);

const CARRIER_PATTERNS: CarrierRule[] = [
  {
    // UPS: "1Z" + 16 alphanumeric.
    carrier: "UPS",
    pattern: /\b1Z[\s-]?(?:[A-Z0-9][\s-]?){16}\b/i
  },
  {
    // Amazon Logistics: "TBA" + 12 digits.
    carrier: "Amazon",
    pattern: /\bTBA\d{12}\b/i
  },
  {
    // USPS Intelligent Mail package barcode: starts with 9, 18–34 digits.
    carrier: "USPS",
    pattern: /\b9\d{2}[\s-]?(?:\d[\s-]?){15,31}\b/,
    validate: (match) => isUspsImpb(normalize(match))
  },
  {
    // FedEx Ground/Express: 12 digits (Express also 15). Require word
    // boundaries so we don't pick up a 12-digit phone number, and reject the
    // USPS "420"+ZIP routing barcode that is also 12 digits.
    carrier: "FedEx",
    pattern: /\b(\d{12}|\d{15})\b/,
    validate: (match) => {
      const digits = normalize(match);
      if (isUspsRoutingPrefix(digits)) return false;
      return (digits.length === 12 || digits.length === 15) && !/^9[1-6]/.test(digits);
    }
  },
  {
    // DHL Express: 10 digits.
    carrier: "DHL",
    pattern: /\b(\d{10})\b/,
    validate: (match) => normalize(match).length === 10
  }
];

/**
 * Fallback extractor: scans freeform OCR/PDF text for the first carrier
 * tracking number. Used only when there is no barcode (or the barcode decode
 * yielded nothing usable).
 */
export const extractTrackingNumber = (text: string): TrackingExtraction | null => {
  if (!text) return null;

  for (const rule of CARRIER_PATTERNS) {
    const match = text.match(rule.pattern);
    if (!match) continue;

    const raw = match[0];
    if (rule.validate && !rule.validate(raw)) continue;

    return {
      trackingNumber: normalize(raw),
      carrier: rule.carrier
    };
  }

  return null;
};

/**
 * Parses a decoded barcode payload into a cleaned tracking number + carrier.
 * Returns null when the payload isn't a recognizable carrier tracking number
 * (e.g. a bare routing code) so the caller can fall back to OCR.
 *
 * "Cleaned" matters: barcode payloads carry GS1 group-separator control chars
 * and routing prefixes that must not be stored as the tracking number.
 */
export const parseBarcodeTracking = (raw: string): TrackingExtraction | null => {
  if (!raw) return null;

  const normalized = normalize(stripControlChars(raw));

  if (/^1Z[A-Z0-9]{16}$/.test(normalized)) {
    return { trackingNumber: normalized, carrier: "UPS" };
  }

  if (/^TBA\d{12}$/.test(normalized)) {
    return { trackingNumber: normalized, carrier: "Amazon" };
  }

  // Recover the IMpb from any leading "420"+ZIP routing segment before testing.
  const digits = stripUspsRoutingPrefix(normalized);

  if (isUspsImpb(digits)) {
    return { trackingNumber: digits, carrier: "USPS" };
  }

  if ((digits.length === 12 || digits.length === 15) && /^\d+$/.test(digits)) {
    // Reject the USPS "420"+ZIP routing barcode masquerading as a 12-digit
    // FedEx number; only accept genuine FedEx numerics.
    if (!isUspsRoutingPrefix(digits) && !/^9[1-6]/.test(digits)) {
      return { trackingNumber: digits, carrier: "FedEx" };
    }
  }

  if (/^\d{10}$/.test(digits)) {
    return { trackingNumber: digits, carrier: "DHL" };
  }

  return null;
};

/**
 * Given a barcode's raw decoded string, infer just the carrier (or null).
 * Thin wrapper over {@link parseBarcodeTracking} for callers that only need to
 * know whether a decode looks like a real carrier tracking number — e.g. the
 * barcode decoder deciding whether to keep a hit or retry on an upscaled image.
 */
export const inferCarrierFromBarcode = (raw: string): DetectedCarrier | null =>
  parseBarcodeTracking(raw)?.carrier ?? null;
