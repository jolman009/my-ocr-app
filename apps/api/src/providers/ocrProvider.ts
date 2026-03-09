import type { OcrResult } from "../types/receipt.js";

export interface OcrProvider {
  extractReceiptText(input: Buffer | string): Promise<OcrResult>;
}