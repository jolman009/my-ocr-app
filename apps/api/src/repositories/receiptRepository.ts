import { Prisma, PrismaClient, ReceiptStatus } from "@prisma/client";
import type { ParsedReceipt, ReceiptFilters, ReceiptListResponse, ReceiptRecord } from "../types/receipt.js";

const prisma = new PrismaClient();
const receiptWithItems = Prisma.validator<Prisma.ReceiptDefaultArgs>()({ include: { items: true } });

type ReceiptWithItems = Prisma.ReceiptGetPayload<typeof receiptWithItems>;

const toNullableNumber = (value: Prisma.Decimal | null): number | null => (value ? Number(value) : null);
const toNullableString = (value: Date | null): string | null => (value ? value.toISOString().slice(0, 10) : null);

const mapRecord = (receipt: ReceiptWithItems): ReceiptRecord => ({
  id: receipt.id,
  imageUrl: receipt.imageUrl,
  merchantName: receipt.merchantName,
  receiptDate: toNullableString(receipt.receiptDate),
  address: receipt.address,
  subtotal: toNullableNumber(receipt.subtotal),
  tax: toNullableNumber(receipt.tax),
  tip: toNullableNumber(receipt.tip),
  total: toNullableNumber(receipt.total),
  currency: receipt.currency,
  status: receipt.status,
  confidence: receipt.confidence as Record<string, number>,
  rawText: receipt.ocrRawText,
  items: receipt.items.map((item) => ({
    name: item.name,
    quantity: item.quantity ? Number(item.quantity) : undefined,
    unitPrice: item.unitPrice ? Number(item.unitPrice) : undefined,
    totalPrice: Number(item.totalPrice)
  })),
  createdAt: receipt.createdAt.toISOString(),
  updatedAt: receipt.updatedAt.toISOString()
});

const buildWhere = (filters: ReceiptFilters): Prisma.ReceiptWhereInput => ({
  merchantName: filters.merchant ? { contains: filters.merchant, mode: "insensitive" } : undefined,
  status: filters.status as ReceiptStatus | undefined,
  receiptDate:
    filters.dateFrom || filters.dateTo
      ? {
          gte: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
          lte: filters.dateTo ? new Date(filters.dateTo) : undefined
        }
      : undefined
});

const toDecimalOrUndefined = (value: number | null | undefined): Prisma.Decimal | null | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return new Prisma.Decimal(value);
};

const toDateOrUndefined = (value: string | null | undefined): Date | null | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return new Date(value);
};

export class ReceiptRepository {
  async create(input: {
    imageUrl: string;
    parsed: ParsedReceipt;
    rawOcr: unknown;
    status: ReceiptStatus;
  }): Promise<ReceiptRecord> {
    const created = await prisma.receipt.create({
      ...receiptWithItems,
      data: {
        imageUrl: input.imageUrl,
        merchantName: input.parsed.merchantName,
        receiptDate: input.parsed.receiptDate ? new Date(input.parsed.receiptDate) : null,
        address: input.parsed.address,
        subtotal: toDecimalOrUndefined(input.parsed.subtotal) ?? null,
        tax: toDecimalOrUndefined(input.parsed.tax) ?? null,
        tip: toDecimalOrUndefined(input.parsed.tip) ?? null,
        total: toDecimalOrUndefined(input.parsed.total) ?? null,
        currency: input.parsed.currency,
        status: input.status,
        confidence: input.parsed.confidence,
        ocrRawText: input.parsed.rawText,
        ocrRawJson: input.rawOcr as Prisma.InputJsonValue,
        items: {
          create: input.parsed.items.map((item, index) => ({
            name: item.name,
            quantity: toDecimalOrUndefined(item.quantity),
            unitPrice: toDecimalOrUndefined(item.unitPrice),
            totalPrice: new Prisma.Decimal(item.totalPrice),
            sortOrder: index
          }))
        }
      }
    });

    return mapRecord(created);
  }

  async list(filters: ReceiptFilters): Promise<ReceiptListResponse> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const where = buildWhere(filters);
    const [total, receipts] = await Promise.all([
      prisma.receipt.count({ where }),
      prisma.receipt.findMany({
        ...receiptWithItems,
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      })
    ]);

    return {
      data: receipts.map(mapRecord),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    };
  }

  async getById(id: string): Promise<ReceiptRecord | null> {
    const receipt = await prisma.receipt.findUnique({ ...receiptWithItems, where: { id } });
    return receipt ? mapRecord(receipt) : null;
  }

  async update(id: string, parsed: Partial<ParsedReceipt>): Promise<ReceiptRecord | null> {
    const updated = await prisma.receipt.update({
      ...receiptWithItems,
      where: { id },
      data: {
        merchantName: parsed.merchantName === undefined ? undefined : parsed.merchantName,
        receiptDate: toDateOrUndefined(parsed.receiptDate),
        address: parsed.address === undefined ? undefined : parsed.address,
        subtotal: toDecimalOrUndefined(parsed.subtotal),
        tax: toDecimalOrUndefined(parsed.tax),
        tip: toDecimalOrUndefined(parsed.tip),
        total: toDecimalOrUndefined(parsed.total),
        currency: parsed.currency === undefined ? undefined : parsed.currency,
        confidence: parsed.confidence ?? undefined,
        ocrRawText: parsed.rawText ?? undefined,
        status: "processed",
        items: parsed.items
          ? {
              deleteMany: {},
              create: parsed.items.map((item, index) => ({
                name: item.name,
                quantity: toDecimalOrUndefined(item.quantity),
                unitPrice: toDecimalOrUndefined(item.unitPrice),
                totalPrice: new Prisma.Decimal(item.totalPrice),
                sortOrder: index
              }))
            }
          : undefined
      }
    });

    return updated ? mapRecord(updated) : null;
  }

  async findForExport(filters: ReceiptFilters): Promise<ReceiptRecord[]> {
    const receipts = await prisma.receipt.findMany({
      ...receiptWithItems,
      where: buildWhere(filters),
      orderBy: { receiptDate: "desc" }
    });

    return receipts.map(mapRecord);
  }
}