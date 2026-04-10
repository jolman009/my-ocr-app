export type ReceiptStatus = "processed" | "needs_review" | "failed";

export interface OcrBlock {
  text: string;
  confidence?: number;
  type: "line" | "word" | "block";
  vertices?: Array<{ x: number; y: number }>;
}

export interface OcrResult {
  rawText: string;
  lines: string[];
  blocks: OcrBlock[];
  raw: unknown;
}

export interface ParsedReceiptItem {
  name: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice: number;
}

export interface ParsedReceipt {
  merchantName: string | null;
  receiptDate: string | null;
  address: string | null;
  subtotal: number | null;
  tax: number | null;
  tip: number | null;
  total: number | null;
  currency: string | null;
  category: string | null;
  items: ParsedReceiptItem[];
  confidence: Record<string, number>;
  rawText: string;
}

export interface ReceiptFilters {
  page?: number;
  limit?: number;
  merchant?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: ReceiptStatus;
  category?: string;
}

export interface ReceiptRecord extends ParsedReceipt {
  id: string;
  imageUrl: string;
  status: ReceiptStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptListResponse {
  data: ReceiptRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}