/**
 * #15 operator-run scorer. Turns a completed 20-package scan run into an
 * at-a-glance V0 gate report (success criteria: 18 of 20 packages get the
 * correct tracking number) and a fillable CSV run sheet.
 *
 * The DB can't know ground truth ("is this the RIGHT tracking number?") — only
 * the operator reading the label can. So this script works in two passes:
 *
 *   1. REPORT + SHEET (default): pull the run's rows, print the automated
 *      scorecard (status / carrier / confidence breakdown, the barcode-first
 *      "auto-clean" proxy count), and write a CSV run sheet with a blank
 *      `correct (Y/N)` column for the observer to fill while scanning.
 *
 *   2. VERIFY: point `--verify=<sheet.csv>` at the filled-in sheet and it
 *      computes the REAL 18/20 gate from the human Y/N column.
 *
 * Selecting the run (report mode):
 *   --last=N            most recent N docs by createdAt (default 20)
 *   --since=<ISO>       only docs created at/after this instant (UTC)
 *   --until=<ISO>       only docs created before this instant (UTC)
 *   --org=<id>          restrict to an organization (default: auto-detect the
 *                       only org that has documents; errors if ambiguous)
 *   --csv=<path>        run-sheet output path (default ./operator-run-<date>.csv)
 *
 * Usage (from apps/forwarding-api):
 *   npm run score:run                          # last 20, report + sheet
 *   npm run score:run -- --since=2026-07-02T13:00:00Z
 *   npm run score:run -- --verify=operator-run-2026-07-02.csv
 *
 * Reads DATABASE_URL from apps/forwarding-api/.env (same as the API).
 * Read-only against the DB — never writes to Postgres.
 */

import { readFileSync, writeFileSync } from "node:fs";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: ".env", override: true });
dotenv.config({ path: "../../.env" });

const GATE_TOTAL = 20;
const GATE_PASS = 18;
// A barcode-first decode lands at 0.95; the OCR fallback caps at ~0.6. Treat a
// processed row at/above this with a tracking number as "auto-clean" — a strong
// proxy for correct, but the human Y/N column is authoritative in verify mode.
const AUTO_CLEAN_CONFIDENCE = 0.9;

type Doc = {
  id: string;
  trackingNumber: string | null;
  carrier: string | null;
  confidence: number | null;
  status: string;
  duplicateOfId: string | null;
  documentType: string | null;
  matchedCustomerId: string | null;
  createdAt: Date;
};

// Mirrors forwarding-web ReviewQueuePage.reviewReason / mobile ReviewQueueScreen.
const reviewReason = (doc: Doc): string => {
  if (doc.duplicateOfId) return "Possible duplicate";
  if (!doc.trackingNumber) return "No tracking number";
  if (doc.confidence !== null && doc.confidence < 0.5) return "Low extraction confidence";
  if (!doc.matchedCustomerId) return "No customer match";
  return "Needs review";
};

const parseArgs = () => {
  const opts: Record<string, string> = {};
  for (const arg of process.argv.slice(2)) {
    const match = /^--([^=]+)(?:=(.*))?$/.exec(arg);
    if (match) opts[match[1]] = match[2] ?? "true";
  }
  return opts;
};

const pct = (n: number, d: number) => (d === 0 ? "0%" : `${Math.round((n / d) * 100)}%`);

// --- CSV helpers (RFC-4180-ish: quote fields with comma/quote/newline) ---
const csvCell = (value: string): string =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

const toCsvRow = (cells: string[]): string => cells.map(csvCell).join(",");

const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") {
      cell += ch;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
};

const SHEET_HEADER = [
  "row",
  "id",
  "tracking_number",
  "carrier",
  "confidence",
  "status",
  "review_reason",
  "correct (Y/N)",
  "notes"
];

const prisma = new PrismaClient();

async function resolveOrgId(explicit?: string): Promise<string> {
  if (explicit) return explicit;
  const orgs = await prisma.shipmentDocument.groupBy({
    by: ["organizationId"],
    _count: { _all: true }
  });
  if (orgs.length === 0) {
    throw new Error("No shipment documents in the DB — nothing to score.");
  }
  if (orgs.length > 1) {
    const list = orgs
      .map((o) => `  ${o.organizationId} (${o._count._all} docs)`)
      .join("\n");
    throw new Error(
      `Multiple orgs have documents — pass --org=<id>:\n${list}`
    );
  }
  return orgs[0].organizationId;
}

async function report(opts: Record<string, string>) {
  const orgId = await resolveOrgId(opts.org);

  const where: Record<string, unknown> = { organizationId: orgId };
  if (opts.since || opts.until) {
    const createdAt: Record<string, Date> = {};
    if (opts.since) createdAt.gte = new Date(opts.since);
    if (opts.until) createdAt.lt = new Date(opts.until);
    where.createdAt = createdAt;
  }

  const take = opts.since || opts.until ? undefined : Number(opts.last ?? GATE_TOTAL);

  const docs = (await prisma.shipmentDocument.findMany({
    where,
    select: {
      id: true,
      trackingNumber: true,
      carrier: true,
      confidence: true,
      status: true,
      duplicateOfId: true,
      documentType: true,
      matchedCustomerId: true,
      createdAt: true
    },
    // Pull newest first (so --last grabs the recent run), then present oldest-first.
    orderBy: { createdAt: "desc" },
    ...(take ? { take } : {})
  })) as Doc[];

  docs.reverse();

  if (docs.length === 0) {
    console.log("No documents matched the selection. Adjust --since/--last/--org.");
    return;
  }

  const window = `${docs[0].createdAt.toISOString()} … ${docs[docs.length - 1].createdAt.toISOString()}`;
  console.log(`\n=== #15 Operator Run — automated scorecard ===`);
  console.log(`org:      ${orgId}`);
  console.log(`selected: ${docs.length} document(s)`);
  console.log(`window:   ${window} (UTC)\n`);

  const byStatus: Record<string, number> = {};
  const byCarrier: Record<string, number> = {};
  let autoClean = 0;
  let duplicates = 0;
  const confBuckets = { high: 0, mid: 0, low: 0, none: 0 };

  for (const d of docs) {
    byStatus[d.status] = (byStatus[d.status] ?? 0) + 1;
    const carrier = d.carrier ?? "(unrecognized)";
    byCarrier[carrier] = (byCarrier[carrier] ?? 0) + 1;
    if (d.duplicateOfId) duplicates += 1;
    if (d.confidence === null) confBuckets.none += 1;
    else if (d.confidence >= AUTO_CLEAN_CONFIDENCE) confBuckets.high += 1;
    else if (d.confidence >= 0.6) confBuckets.mid += 1;
    else confBuckets.low += 1;
    if (
      d.status === "processed" &&
      d.trackingNumber &&
      d.confidence !== null &&
      d.confidence >= AUTO_CLEAN_CONFIDENCE
    ) {
      autoClean += 1;
    }
  }

  console.log("Status:");
  for (const [k, v] of Object.entries(byStatus).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(14)} ${v}  (${pct(v, docs.length)})`);
  }
  console.log("\nCarrier:");
  for (const [k, v] of Object.entries(byCarrier).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(14)} ${v}  (${pct(v, docs.length)})`);
  }
  console.log("\nConfidence:");
  console.log(`  >=0.90 (barcode) ${confBuckets.high}`);
  console.log(`  0.60–0.89 (mixed) ${confBuckets.mid}`);
  console.log(`  <0.60 (OCR/none)  ${confBuckets.low}`);
  console.log(`  null              ${confBuckets.none}`);
  if (duplicates > 0) console.log(`\nDuplicate-flagged: ${duplicates}`);

  const needsReview = docs.filter((d) => d.status !== "processed");
  if (needsReview.length > 0) {
    console.log(`\nNeeds attention (${needsReview.length}):`);
    for (const d of needsReview) {
      console.log(
        `  ${d.id}  ${(d.trackingNumber ?? "—").padEnd(26)} ` +
          `${(d.carrier ?? "—").padEnd(12)} conf=${d.confidence ?? "—"}  → ${reviewReason(d)}`
      );
    }
  }

  console.log(
    `\nAuto-clean proxy: ${autoClean}/${docs.length} processed at ` +
      `>=${AUTO_CLEAN_CONFIDENCE} with a tracking number.`
  );
  if (docs.length === GATE_TOTAL) {
    const verdict = autoClean >= GATE_PASS ? "PROXY PASS ✅" : "below gate ⚠";
    console.log(
      `Gate proxy: ${autoClean}/${GATE_TOTAL} (need ${GATE_PASS}) — ${verdict}`
    );
  } else {
    console.log(
      `(${docs.length} rows selected, gate expects ${GATE_TOTAL} — use --last=20 or a --since window for a formal run.)`
    );
  }

  // --- fillable run sheet ---
  const date = docs[docs.length - 1].createdAt.toISOString().slice(0, 10);
  const csvPath = opts.csv ?? `./operator-run-${date}.csv`;
  const lines = [toCsvRow(SHEET_HEADER)];
  docs.forEach((d, i) => {
    lines.push(
      toCsvRow([
        String(i + 1),
        d.id,
        d.trackingNumber ?? "",
        d.carrier ?? "",
        d.confidence === null ? "" : String(d.confidence),
        d.status,
        reviewReason(d),
        "", // correct (Y/N) — operator fills
        ""  // notes
      ])
    );
  });
  writeFileSync(csvPath, lines.join("\n") + "\n", "utf8");
  console.log(
    `\nRun sheet written: ${csvPath}\n` +
      `  → mark each row Y/N in the "correct (Y/N)" column while scanning,\n` +
      `  → then: npm run score:run -- --verify=${csvPath}\n`
  );
}

function verify(path: string) {
  const rows = parseCsv(readFileSync(path, "utf8"));
  if (rows.length < 2) {
    throw new Error(`${path} has no data rows.`);
  }
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const correctIdx = header.findIndex((h) => h.startsWith("correct"));
  const trackingIdx = header.findIndex((h) => h.includes("tracking"));
  if (correctIdx === -1) {
    throw new Error(`No "correct (Y/N)" column found in ${path}.`);
  }

  let yes = 0;
  let no = 0;
  let blank = 0;
  const failures: string[] = [];
  const dataRows = rows.slice(1);
  for (const row of dataRows) {
    const mark = (row[correctIdx] ?? "").trim().toUpperCase();
    if (mark === "Y" || mark === "YES") yes += 1;
    else if (mark === "N" || mark === "NO") {
      no += 1;
      failures.push(row[trackingIdx] ?? row[1] ?? "(row)");
    } else blank += 1;
  }

  console.log(`\n=== #15 Operator Run — VERIFIED gate (${path}) ===`);
  console.log(`rows scored: ${dataRows.length}`);
  console.log(`  correct (Y): ${yes}`);
  console.log(`  wrong   (N): ${no}`);
  if (blank > 0) console.log(`  unmarked  : ${blank}  ⚠ fill these before trusting the result`);
  if (failures.length > 0) {
    console.log(`\nWrong tracking numbers:`);
    for (const f of failures) console.log(`  - ${f}`);
  }

  const denom = yes + no; // unmarked rows don't count toward the gate
  const verdict =
    blank > 0
      ? "INCOMPLETE — unmarked rows remain"
      : yes >= GATE_PASS && denom >= GATE_TOTAL
        ? "PASS ✅ — V0 gate met"
        : denom < GATE_TOTAL
          ? `INCONCLUSIVE — only ${denom} scored, gate expects ${GATE_TOTAL}`
          : "FAIL ❌ — below 18/20";
  console.log(`\nGate: ${yes}/${denom} correct (need ${GATE_PASS}/${GATE_TOTAL}) — ${verdict}\n`);
}

async function main() {
  const opts = parseArgs();
  if (opts.verify) {
    verify(opts.verify);
    return;
  }
  await report(opts);
}

main()
  .catch((error) => {
    console.error("[score:run] failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
