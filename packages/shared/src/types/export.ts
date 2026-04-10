export type ExportFormat = "csv" | "xlsx";

export const exportColumnKeys = [
  "id",
  "receipt_date",
  "merchant_name",
  "address",
  "subtotal",
  "tax",
  "tip",
  "total",
  "currency",
  "category",
  "status",
  "item_count",
  "created_at"
] as const;

export type ExportColumnKey = (typeof exportColumnKeys)[number];

export interface ExportColumnConfig {
  key: ExportColumnKey;
  label: string;
}

export interface ExportTemplate {
  id: string;
  name: string;
  columns: ExportColumnConfig[];
  dateFormat: "iso" | "us";
  amountFormat: "plain" | "currency";
  createdAt: string;
  updatedAt: string;
}

export interface ExportHistoryEntry {
  id: string;
  templateId: string | null;
  templateName: string;
  format: ExportFormat;
  recordCount: number;
  filtersLabel: string;
  exportedAt: string;
}
