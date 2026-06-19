-- AlterTable
ALTER TABLE "forwarding_shipment_documents" ADD COLUMN IF NOT EXISTS "documentType" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "forwarding_shipment_documents_organizationId_documentType_idx" ON "forwarding_shipment_documents"("organizationId", "documentType");
