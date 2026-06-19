/**
 * One-shot back-fill: classify shipment documents that predate the document
 * classifier (#17). Runs the same classifyDocument() the live pipeline uses over
 * each row's stored ocrRawText, so results match what a fresh upload would get.
 *
 * Usage (from apps/forwarding-api):
 *   npm run reclassify             # back-fill rows where documentType IS NULL
 *   npm run reclassify -- --all    # re-classify every row (e.g. after a rule change)
 *   npm run reclassify -- --dry-run        # report only, write nothing
 *   npm run reclassify -- --all --dry-run  # combine
 *
 * Reads DATABASE_URL from apps/forwarding-api/.env (same as the API). Safe to
 * re-run; it only writes when a row's computed type differs from what's stored.
 */

import { PrismaClient } from "@prisma/client";
import { classifyDocument } from "../src/utils/documentClassifier.js";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const all = args.has("--all");

const BATCH_SIZE = 200;

const prisma = new PrismaClient();

async function main() {
  // Only rows that have text to classify. Without ocrRawText the classifier
  // can only return "unknown", so there's nothing to back-fill.
  const where = {
    ocrRawText: { not: null },
    ...(all ? {} : { documentType: null })
  };

  const total = await prisma.shipmentDocument.count({ where });
  console.log(
    `[reclassify] ${total} document(s) to process ` +
      `(${all ? "all with text" : "unclassified only"})${dryRun ? " — DRY RUN" : ""}.`
  );

  const summary: Record<string, number> = {};
  let processed = 0;
  let changed = 0;
  let cursor: string | undefined;

  // Keyset pagination by id so a long run stays stable even as rows update.
  for (;;) {
    const batch = await prisma.shipmentDocument.findMany({
      where,
      select: { id: true, ocrRawText: true, carrier: true, documentType: true },
      orderBy: { id: "asc" },
      take: BATCH_SIZE,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {})
    });

    if (batch.length === 0) break;
    cursor = batch[batch.length - 1].id;

    for (const doc of batch) {
      processed += 1;
      const { type } = classifyDocument(doc.ocrRawText, {
        hasCarrierTracking: Boolean(doc.carrier)
      });
      summary[type] = (summary[type] ?? 0) + 1;

      if (type === doc.documentType) continue;
      changed += 1;
      if (!dryRun) {
        await prisma.shipmentDocument.update({
          where: { id: doc.id },
          data: { documentType: type }
        });
      }
    }

    console.log(`[reclassify] processed ${processed}/${total}…`);
  }

  console.log("[reclassify] distribution:", summary);
  console.log(
    `[reclassify] done — ${processed} processed, ` +
      `${changed} ${dryRun ? "would change" : "updated"}.`
  );
}

main()
  .catch((error) => {
    console.error("[reclassify] failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
