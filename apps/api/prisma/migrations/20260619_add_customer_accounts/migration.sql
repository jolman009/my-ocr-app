-- CreateTable
CREATE TABLE IF NOT EXISTS "forwarding_customer_accounts" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mailboxNumber" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forwarding_customer_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "forwarding_customer_accounts_organizationId_mailboxNumber_key" ON "forwarding_customer_accounts"("organizationId", "mailboxNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "forwarding_customer_accounts_organizationId_idx" ON "forwarding_customer_accounts"("organizationId");

-- AlterTable
ALTER TABLE "forwarding_shipment_documents"
  ADD COLUMN IF NOT EXISTS "recipientName" TEXT,
  ADD COLUMN IF NOT EXISTS "mailboxNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "matchedCustomerId" TEXT,
  ADD COLUMN IF NOT EXISTS "customerMatchConfidence" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "forwarding_shipment_documents_organizationId_matchedCustomerId_idx" ON "forwarding_shipment_documents"("organizationId", "matchedCustomerId");

-- AddForeignKey (guarded so the migration is safe to re-run)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'forwarding_customer_accounts_organizationId_fkey'
  ) THEN
    ALTER TABLE "forwarding_customer_accounts"
      ADD CONSTRAINT "forwarding_customer_accounts_organizationId_fkey"
      FOREIGN KEY ("organizationId") REFERENCES "forwarding_organizations"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'forwarding_shipment_documents_matchedCustomerId_fkey'
  ) THEN
    ALTER TABLE "forwarding_shipment_documents"
      ADD CONSTRAINT "forwarding_shipment_documents_matchedCustomerId_fkey"
      FOREIGN KEY ("matchedCustomerId") REFERENCES "forwarding_customer_accounts"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
