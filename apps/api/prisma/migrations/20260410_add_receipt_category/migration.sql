-- AlterTable
ALTER TABLE "Receipt" ADD COLUMN IF NOT EXISTS "category" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Receipt_category_idx" ON "Receipt"("category");
