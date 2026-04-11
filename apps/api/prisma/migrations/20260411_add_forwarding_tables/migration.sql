-- CreateEnum
CREATE TYPE "ShipmentDocumentStatus" AS ENUM ('processed', 'needs_review', 'failed');

-- CreateTable
CREATE TABLE "forwarding_organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forwarding_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forwarding_organization_members" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forwarding_organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forwarding_shipment_documents" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "uploadedById" TEXT,
    "imageUrl" TEXT NOT NULL,
    "trackingNumber" TEXT,
    "carrier" TEXT,
    "barcodeRaw" TEXT,
    "barcodeFormat" TEXT,
    "ocrRawText" TEXT,
    "ocrRawJson" JSONB,
    "confidence" DOUBLE PRECISION,
    "status" "ShipmentDocumentStatus" NOT NULL DEFAULT 'processed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forwarding_shipment_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forwarding_organizations_slug_key" ON "forwarding_organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "forwarding_organization_members_organizationId_userId_key" ON "forwarding_organization_members"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "forwarding_organization_members_userId_idx" ON "forwarding_organization_members"("userId");

-- CreateIndex
CREATE INDEX "forwarding_shipment_documents_organizationId_trackingNumber_idx" ON "forwarding_shipment_documents"("organizationId", "trackingNumber");

-- CreateIndex
CREATE INDEX "forwarding_shipment_documents_organizationId_createdAt_idx" ON "forwarding_shipment_documents"("organizationId", "createdAt");

-- AddForeignKey
ALTER TABLE "forwarding_organization_members" ADD CONSTRAINT "forwarding_organization_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "forwarding_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forwarding_organization_members" ADD CONSTRAINT "forwarding_organization_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forwarding_shipment_documents" ADD CONSTRAINT "forwarding_shipment_documents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "forwarding_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forwarding_shipment_documents" ADD CONSTRAINT "forwarding_shipment_documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
