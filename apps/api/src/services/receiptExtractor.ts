import type { OcrResult, ParsedReceipt, ParsedReceiptItem } from "../types/receipt.js";

const datePatterns = [
  /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/,
  /\b(\d{4}-\d{2}-\d{2})\b/,
  /\b([A-Z][a-z]{2,8}\s+\d{1,2},?\s+\d{4})\b/
];

const amountPattern = /(-?\$?\d+\.\d{2})/g;
const streetPattern = /\d+\s+[A-Za-z0-9.\-\s]+(?:St|Street|Ave|Avenue|Blvd|Road|Rd|Lane|Ln|Dr|Drive|Way)\b/i;
const cityStatePattern = /[A-Za-z\s]+,\s?[A-Z]{2}\s+\d{5}(?:-\d{4})?/;
const ignoredItemKeywords = ["subtotal", "tax", "tip", "total", "balance", "amount due", "visa", "mastercard", "amex", "cash", "change", "thank", "table", "server"];

const toNumber = (value: string): number => Number.parseFloat(value.replace(/[$,]/g, ""));

const clampConfidence = (value: number): number => Math.max(0, Math.min(1, value));

const parseDate = (value: string): string | null => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const [month, day, year] = value.split("/");
    if (month && day && year) {
      const normalizedYear = year.length === 2 ? `20${year}` : year;
      const fallback = new Date(`${normalizedYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
      if (!Number.isNaN(fallback.getTime())) {
        return fallback.toISOString().slice(0, 10);
      }
    }
    return null;
  }
  return parsed.toISOString().slice(0, 10);
};

const findDate = (lines: string[]): string | null => {
  for (const line of lines) {
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        return parseDate(match[1]);
      }
    }
  }
  return null;
};

const findAmountByKeywords = (lines: string[], keywords: string[]): number | null => {
  const matches = lines
    .filter((line) => keywords.some((keyword) => line.toLowerCase().includes(keyword)))
    .flatMap((line) => Array.from(line.matchAll(amountPattern)).map((match) => toNumber(match[1])));

  if (!matches.length) {
    return null;
  }

  return matches[matches.length - 1] ?? null;
};

const findTotal = (lines: string[]): number | null => {
  const totalKeywords = ["grand total", "total", "amount due", "balance due", "balance"];
  const keywordAmount = findAmountByKeywords(lines, totalKeywords);

  if (keywordAmount !== null) {
    return keywordAmount;
  }

  const allAmounts = lines.flatMap((line) => Array.from(line.matchAll(amountPattern)).map((match) => toNumber(match[1])));
  if (!allAmounts.length) {
    return null;
  }

  return Math.max(...allAmounts);
};

const findMerchantName = (lines: string[]): string | null => {
  return (
    lines.find((line) => {
      const trimmed = line.trim();
      return trimmed.length > 2 && /[A-Za-z]/.test(trimmed) && !streetPattern.test(trimmed) && !trimmed.match(datePatterns[0]);
    }) ?? null
  );
};

const findAddress = (lines: string[]): string | null => {
  const index = lines.findIndex((line) => streetPattern.test(line));
  if (index === -1) {
    return null;
  }

  const parts = [lines[index]];
  const next = lines[index + 1];
  if (next && cityStatePattern.test(next)) {
    parts.push(next);
  }
  return parts.join(", ");
};

const parseItemLine = (line: string): ParsedReceiptItem | null => {
  const normalized = line.trim().replace(/\s{2,}/g, " ");
  if (!normalized) {
    return null;
  }

  const lower = normalized.toLowerCase();
  if (ignoredItemKeywords.some((keyword) => lower.includes(keyword))) {
    return null;
  }

  const match = normalized.match(/^(.*?)(?:\s+)(-?\$?\d+\.\d{2})$/);
  if (!match) {
    return null;
  }

  const name = match[1].trim();
  if (!name || name.length < 2 || /^\d+[./-]\d+/.test(name)) {
    return null;
  }

  let quantity: number | undefined;
  let unitPrice: number | undefined;
  const quantityMatch = name.match(/^(\d+)x?\s+(.+)$/i);
  const cleanName = quantityMatch ? quantityMatch[2].trim() : name;
  if (quantityMatch) {
    quantity = Number.parseInt(quantityMatch[1], 10);
  }

  const totalPrice = toNumber(match[2]);
  if (quantity && quantity > 0) {
    unitPrice = Number.parseFloat((totalPrice / quantity).toFixed(2));
  }

  return {
    name: cleanName,
    quantity,
    unitPrice,
    totalPrice
  };
};

const findItems = (lines: string[]): ParsedReceiptItem[] => {
  return lines.map(parseItemLine).filter((item): item is ParsedReceiptItem => Boolean(item));
};

export class ReceiptExtractor {
  parse(result: OcrResult): ParsedReceipt {
    const lines = (result.lines.length ? result.lines : result.rawText.split(/\r?\n/))
      .map((line) => line.trim())
      .filter(Boolean);

    const merchantName = findMerchantName(lines);
    const receiptDate = findDate(lines);
    const address = findAddress(lines);
    const subtotal = findAmountByKeywords(lines, ["subtotal"]);
    const tax = findAmountByKeywords(lines, ["tax"]);
    const tip = findAmountByKeywords(lines, ["tip", "gratuity"]);
    const total = findTotal(lines);
    const items = findItems(lines);
    const currency = result.rawText.includes("$") ? "USD" : null;

    const confidence = {
      merchantName: clampConfidence(merchantName ? 0.92 : 0.2),
      receiptDate: clampConfidence(receiptDate ? 0.85 : 0.2),
      address: clampConfidence(address ? 0.75 : 0.25),
      subtotal: clampConfidence(subtotal !== null ? 0.78 : 0.2),
      tax: clampConfidence(tax !== null ? 0.8 : 0.2),
      tip: clampConfidence(tip !== null ? 0.75 : 0.2),
      total: clampConfidence(total !== null ? 0.9 : 0.1),
      items: clampConfidence(items.length ? Math.min(0.95, 0.45 + items.length * 0.1) : 0.2)
    };

    return {
      merchantName,
      receiptDate,
      address,
      subtotal,
      tax,
      tip,
      total,
      currency,
      items,
      confidence,
      rawText: result.rawText
    };
  }
}