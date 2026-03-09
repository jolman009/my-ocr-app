import { Parser as Json2CsvParser } from "json2csv";
import ExcelJS from "exceljs";
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

export class ExportService {
  constructor(private readonly repository: ReceiptRepository) {}

  async generateCsv(filters: ReceiptFilters): Promise<string> {
    const receipts = await this.repository.findForExport(filters);
    const parser = new Json2CsvParser({ fields: receiptFields as unknown as string[] });
    return parser.parse(buildReceiptRows(receipts));
  }

  async generateWorkbook(filters: ReceiptFilters): Promise<Buffer> {
    const receipts = await this.repository.findForExport(filters);
    const workbook = new ExcelJS.Workbook();
    const receiptsSheet = workbook.addWorksheet("Receipts");
    const itemsSheet = workbook.addWorksheet("Items");

    const receiptRows = buildReceiptRows(receipts);
    const itemRows = buildItemRows(receipts);

    receiptsSheet.columns = receiptFields.map((key) => ({ key, header: key, width: 20 }));
    itemsSheet.columns = itemFields.map((key) => ({ key, header: key, width: 20 }));
    receiptsSheet.addRows(receiptRows);
    itemsSheet.addRows(itemRows);

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
}