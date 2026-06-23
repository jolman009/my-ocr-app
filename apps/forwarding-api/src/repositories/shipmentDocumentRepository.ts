import { PrismaClient, type ShipmentDocument, type ShipmentDocumentStatus } from "@prisma/client";
import type { FieldCorrectionEntry } from "../utils/fieldCorrectionDiff.js";

const prisma = new PrismaClient();

export interface UpdateAudit {
  organizationId: string;
  editedById: string | null;
  corrections: FieldCorrectionEntry[];
}

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
  documentType: string | null;
  recipientName: string | null;
  mailboxNumber: string | null;
  matchedCustomerId: string | null;
  customerMatchConfidence: number | null;
  confidence: number | null;
  status: ShipmentDocumentStatus;
  duplicateOfId?: string | null;
}

export interface ListShipmentDocumentsFilters {
  organizationId: string;
  q?: string;
  type?: string;
  customerId?: string;
  status?: ShipmentDocumentStatus;
  page?: number;
  limit?: number;
}

export interface UpdateShipmentDocumentInput {
  trackingNumber?: string | null;
  carrier?: string | null;
  recipientName?: string | null;
  mailboxNumber?: string | null;
  documentType?: string | null;
  matchedCustomerId?: string | null;
  status?: ShipmentDocumentStatus;
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
        documentType: input.documentType,
        recipientName: input.recipientName,
        mailboxNumber: input.mailboxNumber,
        matchedCustomerId: input.matchedCustomerId,
        customerMatchConfidence: input.customerMatchConfidence,
        confidence: input.confidence,
        status: input.status,
        duplicateOfId: input.duplicateOfId ?? null
      }
    });
  }

  /**
   * Earliest non-rejected document in the org carrying this exact tracking
   * number, or null. Drives duplicate detection (#21) — `failed` (rejected)
   * documents are ignored so a re-scan after a rejection isn't flagged.
   */
  async findDuplicate(
    organizationId: string,
    trackingNumber: string
  ): Promise<ShipmentDocument | null> {
    return prisma.shipmentDocument.findFirst({
      where: {
        organizationId,
        trackingNumber,
        status: { not: "failed" }
      },
      orderBy: { createdAt: "asc" }
    });
  }

  async list(filters: ListShipmentDocumentsFilters): Promise<ShipmentDocumentListResult> {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);
    const where = {
      organizationId: filters.organizationId,
      trackingNumber: filters.q
        ? { contains: filters.q, mode: "insensitive" as const }
        : undefined,
      documentType: filters.type ?? undefined,
      matchedCustomerId: filters.customerId ?? undefined,
      status: filters.status ?? undefined
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

  async update(
    id: string,
    data: UpdateShipmentDocumentInput,
    audit?: UpdateAudit
  ): Promise<ShipmentDocument> {
    // Undefined fields are ignored by Prisma, so only the keys the caller set
    // are written — null is a deliberate "clear this field".
    const updateOp = prisma.shipmentDocument.update({ where: { id }, data });

    if (!audit || audit.corrections.length === 0) {
      return updateOp;
    }

    // Write the document update and its audit rows atomically so the trail can
    // never drift from the record it describes.
    const [updated] = await prisma.$transaction([
      updateOp,
      prisma.fieldCorrection.createMany({
        data: audit.corrections.map((c) => ({
          organizationId: audit.organizationId,
          shipmentDocumentId: id,
          userId: audit.editedById,
          fieldName: c.fieldName,
          oldValue: c.oldValue,
          newValue: c.newValue
        }))
      })
    ]);
    return updated;
  }
}
