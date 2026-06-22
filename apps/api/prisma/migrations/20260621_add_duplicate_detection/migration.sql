-- #21 Duplicate tracking detection.

-- AlterTable: record the earliest matching document when a tracking number repeats.
ALTER TABLE "forwarding_shipment_documents"
  ADD COLUMN IF NOT EXISTS "duplicateOfId" TEXT;

-- CreateIndex: soft-block guard. Two documents in the same organization can share
-- a tracking number while one is in review, but they can never BOTH be accepted
-- (status = 'processed'). The partial unique index enforces this; NULL tracking
-- numbers are excluded so unreadable scans don't collide.
CREATE UNIQUE INDEX IF NOT EXISTS "forwarding_shipment_documents_org_tracking_processed_key"
  ON "forwarding_shipment_documents" ("organizationId", "trackingNumber")
  WHERE "status" = 'processed' AND "trackingNumber" IS NOT NULL;
