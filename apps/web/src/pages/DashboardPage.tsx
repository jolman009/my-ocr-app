import { useDeferredValue, useState } from "react";
import type { ReceiptStatus } from "@receipt-ocr/shared/types";
import { ExportMenu } from "../components/ExportMenu";
import { ReceiptTable } from "../components/ReceiptTable";
import { ReceiptUploader } from "../components/ReceiptUploader";
import { useReceipts } from "@receipt-ocr/shared/hooks";

export const DashboardPage = () => {
  const [merchant, setMerchant] = useState("");
  const [status, setStatus] = useState<"" | ReceiptStatus>("");
  const deferredMerchant = useDeferredValue(merchant);
  const filters = {
    merchant: deferredMerchant || undefined,
    status: status || undefined
  };
  const { data, isLoading } = useReceipts(filters);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-panel backdrop-blur">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-tide">Receipt Radar</p>
          <h1 className="mt-4 max-w-2xl font-display text-5xl font-semibold tracking-tight text-ink">
            Turn paper receipts into a clean, searchable expense ledger.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Capture a receipt, extract merchant and totals with OCR, review line items, and export the finished records to CSV or Excel.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">React + Tailwind</div>
            <div className="rounded-full bg-ember px-4 py-2 text-sm font-medium text-white">OCR Ready</div>
            <div className="rounded-full bg-tide px-4 py-2 text-sm font-medium text-white">CSV/XLSX Export</div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-panel">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-300">Flow</p>
          <ol className="mt-5 space-y-4 text-sm text-slate-300">
            <li>1. Upload or photograph the receipt.</li>
            <li>2. Server preprocesses the image and runs OCR.</li>
            <li>3. Parsed fields are stored for review.</li>
            <li>4. User corrects anything uncertain and exports the data.</li>
          </ol>
        </div>
      </section>
      <ReceiptUploader />
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <input
            value={merchant}
            onChange={(event) => setMerchant(event.target.value)}
            placeholder="Filter by merchant"
            className="rounded-full border border-slate-200 bg-white/85 px-4 py-3 text-sm shadow-panel"
          />
          <select value={status} onChange={(event) => setStatus(event.target.value as "" | ReceiptStatus)} className="rounded-full border border-slate-200 bg-white/85 px-4 py-3 text-sm shadow-panel">
            <option value="">All statuses</option>
            <option value="processed">Processed</option>
            <option value="needs_review">Needs review</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <ExportMenu filters={filters} />
      </section>
      {isLoading ? <div className="rounded-[2rem] bg-white/90 p-6 shadow-panel">Loading receipts...</div> : <ReceiptTable receipts={data?.data ?? []} />}
    </div>
  );
};
