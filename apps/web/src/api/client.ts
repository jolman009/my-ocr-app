import type { ReceiptFilters, ReceiptListResponse, ReceiptRecord } from "../types/receipt";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const API_ORIGIN = API_BASE.replace(/\/api$/, "");

const normalizeNumber = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }
  return value;
};

const normalizeString = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

export const getReceiptImageUrl = (imageUrl: string) => `${API_ORIGIN}${imageUrl}`;

const toQueryString = (filters?: ReceiptFilters) => {
  const params = new URLSearchParams();
  if (filters?.merchant) {
    params.set("merchant", filters.merchant);
  }
  if (filters?.status) {
    params.set("status", filters.status);
  }
  return params.toString();
};

export const listReceipts = async (filters?: ReceiptFilters): Promise<ReceiptListResponse> => {
  const query = toQueryString(filters);
  const response = await fetch(`${API_BASE}/receipts${query ? `?${query}` : ""}`);
  if (!response.ok) {
    throw new Error("Failed to load receipts.");
  }
  return response.json();
};

export const getReceipt = async (id: string): Promise<ReceiptRecord> => {
  const response = await fetch(`${API_BASE}/receipts/${id}`);
  if (!response.ok) {
    throw new Error("Failed to load receipt.");
  }
  return response.json();
};

export const uploadReceipt = async (file: File): Promise<{ id: string; status: string; receipt: ReceiptRecord }> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE}/receipts`, {
    method: "POST",
    body: formData
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Upload failed." }));
    throw new Error(error.message ?? "Upload failed.");
  }
  return response.json();
};

export const updateReceipt = async (receipt: ReceiptRecord): Promise<ReceiptRecord> => {
  const response = await fetch(`${API_BASE}/receipts/${receipt.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      merchantName: normalizeString(receipt.merchantName),
      receiptDate: normalizeString(receipt.receiptDate),
      address: normalizeString(receipt.address),
      subtotal: normalizeNumber(receipt.subtotal),
      tax: normalizeNumber(receipt.tax),
      tip: normalizeNumber(receipt.tip),
      total: normalizeNumber(receipt.total),
      currency: normalizeString(receipt.currency),
      rawText: receipt.rawText,
      confidence: receipt.confidence,
      items: receipt.items.map((item) => ({
        name: item.name.trim(),
        quantity: normalizeNumber(item.quantity),
        unitPrice: normalizeNumber(item.unitPrice),
        totalPrice: normalizeNumber(item.totalPrice) ?? 0
      }))
    })
  });
  if (!response.ok) {
    throw new Error("Failed to save receipt.");
  }
  return response.json();
};

export const getExportUrl = (format: "csv" | "xlsx", filters?: ReceiptFilters) => {
  const query = toQueryString(filters);
  return `${API_BASE}/exports/receipts.${format}${query ? `?${query}` : ""}`;
};