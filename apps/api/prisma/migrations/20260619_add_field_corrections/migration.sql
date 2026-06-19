-- CreateTable
CREATE TABLE IF NOT EXISTS "forwarding_field_corrections" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "shipmentDocumentId" TEXT NOT NULL,
    "userId" TEXT,
    "fieldName" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forwarding_field_corrections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "forwarding_field_corrections_shipmentDocumentId_idx" ON "forwarding_field_corrections"("shipmentDocumentId");
CREATE INDEX IF NOT EXISTS "forwarding_field_corrections_organizationId_createdAt_idx" ON "forwarding_field_corrections"("organizationId", "createdAt");

-- AddForeignKey (guarded so the migration is safe to re-run)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'forwarding_field_corrections_organizationId_fkey') THEN
    ALTER TABLE "forwarding_field_corrections"
      ADD CONSTRAINT "forwarding_field_corrections_organizationId_fkey"
      FOREIGN KEY ("organizationId") REFERENCES "forwarding_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'forwarding_field_corrections_shipmentDocumentId_fkey') THEN
    ALTER TABLE "forwarding_field_corrections"
      ADD CONSTRAINT "forwarding_field_corrections_shipmentDocumentId_fkey"
      FOREIGN KEY ("shipmentDocumentId") REFERENCES "forwarding_shipment_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'forwarding_field_corrections_userId_fkey') THEN
    ALTER TABLE "forwarding_field_corrections"
      ADD CONSTRAINT "forwarding_field_corrections_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
