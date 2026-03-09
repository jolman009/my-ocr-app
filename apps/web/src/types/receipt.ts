export interface ReceiptItem {
  name: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice: number;
}

export interface ReceiptRecord {
  id: string;
  imageUrl: string;
  merchantName: string | null;
  receiptDate: string | null;
  address: string | null;
  subtotal: number | null;
  tax: number | null;
  tip: number | null;
  total: number | null;
  currency: string | null;
  status: "processed" | "needs_review" | "failed";
  confidence: Record<string, number>;
  rawText: string;
  items: ReceiptItem[];
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

export interface ReceiptFilters {
  merchant?: string;
  status?: string;
}