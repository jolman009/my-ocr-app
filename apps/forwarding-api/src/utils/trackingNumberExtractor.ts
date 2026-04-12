/**
 * Extracts a likely shipping tracking number + carrier from freeform OCR text.
 * Used only as fallback when the image has no barcode (or barcode decode
 * fails). Barcodes are always more reliable when present.
 *
 * Patterns tuned for the major US carriers. Returns the first match found;
 * no scoring or tie-breaking. If multiple patterns match the same string,
 * the first rule in CARRIER_PATTERNS wins.
 */

export type DetectedCarrier = "UPS" | "FedEx" | "USPS" | "DHL";

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

const CARRIER_PATTERNS: CarrierRule[] = [
  {
    // UPS: "1Z" + 16 alphanumeric
    carrier: "UPS",
    pattern: /\b1Z[\s-]?(?:[A-Z0-9][\s-]?){16}\b/i
  },
  {
    // USPS tracking: 22 digits starting 92/94, or 20 digits starting 91
    // (also covers Priority Mail Express formats).
    carrier: "USPS",
    pattern: /\b(?:9[1-5]\d{2}[\s-]?(?:\d[\s-]?){16,18})\b/
  },
  {
    // FedEx Ground: 12 digits. FedEx Express: 12 digits. Freight: 10.
    // Require word boundaries so we don't pick up a 12-digit phone number
    // embedded in a longer digit run.
    carrier: "FedEx",
    pattern: /\b(\d{12})\b/,
    validate: (match) => {
      const digits = normalize(match);
      // Don't confuse with USPS (20+ digits) or UPS (has letters).
      return digits.length === 12 && !/^9[1-5]/.test(digits);
    }
  },
  {
    // DHL Express: 10 digits.
    carrier: "DHL",
    pattern: /\b(\d{10})\b/,
    validate: (match) => {
      const digits = normalize(match);
      return digits.length === 10;
    }
  }
];

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
 * Given a barcode's raw decoded string, infer carrier from format.
 * Called when we DO have a barcode but want to tag the carrier.
 */
export const inferCarrierFromBarcode = (raw: string): DetectedCarrier | null => {
  const normalized = normalize(raw);

  if (/^1Z[A-Z0-9]{16}$/.test(normalized)) return "UPS";
  if (/^9[1-5]\d{18,20}$/.test(normalized)) return "USPS";
  if (/^\d{12}$/.test(normalized) || /^\d{15}$/.test(normalized)) return "FedEx";
  if (/^\d{10}$/.test(normalized)) return "DHL";

  return null;
};
