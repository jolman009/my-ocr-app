import { PrismaClient, type ShipmentDocument, type ShipmentDocumentStatus } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateShipmentDocumentInput {
  organizationId: string;
  uploadedById?: string | null;
  imageUrl: string;
  trackingNumber: string | null;
  carrier: string | null;
  barcodeRaw: string | null;
  barcodeFormat: string | null;
  ocrRawText: string | null;
  ocrRawJson: unknown;
  confidence: number | null;
  status: ShipmentDocumentStatus;
}

export interface ListShipmentDocumentsFilters {
  organizationId: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface ShipmentDocumentListResult {
  data: ShipmentDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ShipmentDocumentRepository {
  async create(input: CreateShipmentDocumentInput): Promise<ShipmentDocument> {
    return prisma.shipmentDocument.create({
      data: {
        organizationId: input.organizationId,
        uploadedById: input.uploadedById ?? null,
        imageUrl: input.imageUrl,
        trackingNumber: input.trackingNumber,
        carrier: input.carrier,
        barcodeRaw: input.barcodeRaw,
        barcodeFormat: input.barcodeFormat,
        ocrRawText: input.ocrRawText,
        ocrRawJson: (input.ocrRawJson ?? null) as never,
        confidence: input.confidence,
        status: input.status
      }
    });
  }

  async list(filters: ListShipmentDocumentsFilters): Promise<ShipmentDocumentListResult> {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);
    const where = {
      organizationId: filters.organizationId,
      trackingNumber: filters.q
        ? { contains: filters.q, mode: "insensitive" as const }
        : undefined
    };

    const [total, data] = await Promise.all([
      prisma.shipmentDocument.count({ where }),
      prisma.shipmentDocument.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      })
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    };
  }

  async findById(id: string, organizationId: string): Promise<ShipmentDocument | null> {
    return prisma.shipmentDocument.findFirst({
      where: { id, organizationId }
    });
  }
}
