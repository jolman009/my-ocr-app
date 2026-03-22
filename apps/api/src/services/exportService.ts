import { Parser as Json2CsvParser } from "json2csv";
import ExcelJS from "exceljs";
import type { ExportTemplate } from "@receipt-ocr/shared/types";
import type { ReceiptFilters, ReceiptRecord } from "../types/receipt.js";
import { ReceiptRepository } from "../repositories/receiptRepository.js";

const receiptFields = [
  "id",
  "receipt_date",
  "merchant_name",
  "address",
  "subtotal",
  "tax",
  "tip",
  "total",
  "currency",
  "status",
  "item_count",
  "created_at"
] as const;

const itemFields = [
  "receipt_id",
  "merchant_name",
  "receipt_date",
  "item_name",
  "quantity",
  "unit_price",
  "total_price"
] as const;

const buildReceiptRows = (receipts: ReceiptRecord[]) =>
  receipts.map((receipt) => ({
    id: receipt.id,
    receipt_date: receipt.receiptDate,
    merchant_name: receipt.merchantName,
    address: receipt.address,
    subtotal: receipt.subtotal,
    tax: receipt.tax,
    tip: receipt.tip,
    total: receipt.total,
    currency: receipt.currency,
    status: receipt.status,
    item_count: receipt.items.length,
    created_at: receipt.createdAt
  }));

const buildItemRows = (receipts: ReceiptRecord[]) =>
  receipts.flatMap((receipt) =>
    receipt.items.map((item) => ({
      receipt_id: receipt.id,
      merchant_name: receipt.merchantName,
      receipt_date: receipt.receiptDate,
      item_name: item.name,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice
    }))
  );

type ReceiptRow = ReturnType<typeof buildReceiptRows>[number];

const formatDate = (value: string | null, format: ExportTemplate["dateFormat"]) => {
  if (!value) {
    return value;
  }

  if (format === "us") {
    const [year, month, day] = value.split("-");
    return `${month}/${day}/${year}`;
  }

  return value;
};

const formatAmount = (value: number | null, format: ExportTemplate["amountFormat"]) => {
  if (value === null) {
    return null;
  }

  return format === "currency" ? `$${value.toFixed(2)}` : value;
};

const applyTemplate = (rows: ReceiptRow[], template?: ExportTemplate) => {
  if (!template) {
    return {
      columns: receiptFields.map((key) => ({ key, header: key, width: 20 })),
      rows
    };
  }

  const templatedRows = rows.map((row) => {
    const next: Record<string, string | number | null> = {};

    for (const column of template.columns) {
      let value = row[column.key as keyof ReceiptRow] as string | number | null;

      if (column.key === "receipt_date" || column.key === "created_at") {
        value = formatDate(typeof value === "string" ? value : null, template.dateFormat);
      }

      if (
        column.key === "subtotal" ||
        column.key === "tax" ||
        column.key === "tip" ||
        column.key === "total"
      ) {
        value = formatAmount(typeof value === "number" ? value : null, template.amountFormat);
      }

      next[column.key] = value;
    }

    return next;
  });

  return {
    columns: template.columns.map((column) => ({ key: column.key, header: column.label, width: 20 })),
    rows: templatedRows
  };
};

export class ExportService {
  constructor(private readonly repository: ReceiptRepository) {}

  async generateCsv(filters: ReceiptFilters, userId?: string, template?: ExportTemplate): Promise<string> {
    const receipts = await this.repository.findForExport(filters, userId);
    const { columns, rows } = applyTemplate(buildReceiptRows(receipts), template);
    const parser = new Json2CsvParser({
      fields: columns.map((column) => ({ label: column.header, value: column.key }))
    });
    return parser.parse(rows);
  }

  async generateWorkbook(filters: ReceiptFilters, userId?: string, template?: ExportTemplate): Promise<Buffer> {
    const receipts = await this.repository.findForExport(filters, userId);
    const workbook = new ExcelJS.Workbook();
    const receiptsSheet = workbook.addWorksheet("Receipts");
    const receiptRows = buildReceiptRows(receipts);
    const { columns, rows } = applyTemplate(receiptRows, template);

    receiptsSheet.columns = columns;
    receiptsSheet.addRows(rows);

    if (!template) {
      const itemsSheet = workbook.addWorksheet("Items");
      const itemRows = buildItemRows(receipts);
      itemsSheet.columns = itemFields.map((key) => ({ key, header: key, width: 20 }));
      itemsSheet.addRows(itemRows);
    }

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
}
