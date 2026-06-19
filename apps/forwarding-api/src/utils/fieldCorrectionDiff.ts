/**
 * Computes the audit trail (#20) for an operator's review edit: one entry per
 * field whose value actually changed between the stored document and the patch.
 * Only the human-editable fields are audited — derived/raw fields (OCR text,
 * confidence, barcode) are never edited by hand, so they're out of scope.
 *
 * Pure and DB-free so it can be unit-tested and reused wherever an edit happens.
 */

export interface FieldCorrectionEntry {
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
}

// The fields the review queue lets an operator change (see updateSchema in the
// shipment document controller). Order here is the order corrections are logged.
export const AUDITED_FIELDS = [
  "trackingNumber",
  "carrier",
  "recipientName",
  "mailboxNumber",
  "documentType",
  "matchedCustomerId",
  "status"
] as const;

export type AuditedField = (typeof AUDITED_FIELDS)[number];

const normalize = (value: unknown): string | null =>
  value === null || value === undefined ? null : String(value);

/**
 * @param existing the document as currently stored (before the edit)
 * @param patch    the validated edit — only keys the operator actually sent
 */
export const diffCorrections = (
  existing: Record<string, unknown>,
  patch: Record<string, unknown>
): FieldCorrectionEntry[] => {
  const corrections: FieldCorrectionEntry[] = [];

  for (const field of AUDITED_FIELDS) {
    // Only audit fields the patch explicitly set — an absent key means "leave
    // unchanged", which is not a correction.
    if (!(field in patch)) continue;

    const oldValue = normalize(existing[field]);
    const newValue = normalize(patch[field]);
    if (oldValue !== newValue) {
      corrections.push({ fieldName: field, oldValue, newValue });
    }
  }

  return corrections;
};
