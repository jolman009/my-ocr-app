import { PrismaClient, type FieldCorrection } from "@prisma/client";

const prisma = new PrismaClient();

export class FieldCorrectionRepository {
  /** Audit history for one document, newest edit first. */
  async listByDocument(shipmentDocumentId: string): Promise<FieldCorrection[]> {
    return prisma.fieldCorrection.findMany({
      where: { shipmentDocumentId },
      orderBy: { createdAt: "desc" }
    });
  }
}
