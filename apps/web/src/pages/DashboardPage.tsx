import { useDeferredValue, useState } from "react";
import { Link } from "react-router-dom";
import type { ReceiptStatus } from "@receipt-ocr/shared/types";
import { ReceiptTable } from "../components/ReceiptTable";
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
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-tide">Workspace home</p>
          <h1 className="mt-4 max-w-2xl font-display text-5xl font-semibold tracking-tight text-ink">
            Keep your receipts tidy enough for books, taxes, and handoff.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Use this home surface to track recent receipts, filter what needs attention, and jump into focused Capture, Export,
            and Settings workflows.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">Header-field OCR</div>
            <div className="rounded-full bg-ember px-4 py-2 text-sm font-medium text-white">Manual review</div>
            <div className="rounded-full bg-tide px-4 py-2 text-sm font-medium text-white">CSV/XLSX export</div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-panel">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-300">Today&apos;s rhythm</p>
          <ol className="mt-5 space-y-4 text-sm text-slate-300">
            <li>1. Upload the next receipt you want off your desk.</li>
            <li>2. OCR extracts vendor, date, subtotal, tax, and total.</li>
            <li>3. Review anything uncertain before it becomes part of your records.</li>
            <li>4. Export the finished ledger when you need to update your spreadsheet.</li>
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/app/capture"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-100"
            >
              Open Capture
            </Link>
            <Link
              to="/app/exports"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
            >
              Open Exports
            </Link>
            <Link
              to="/app/settings"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
            >
              Open Settings
            </Link>
          </div>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-panel">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide">Next action</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink">Capture now lives in its own workflow.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Open the dedicated Capture screen when you want to upload or photograph the next receipt. That flow now owns the
            uploader and OCR progress state.
          </p>
          <Link
            to="/app/capture"
            className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open Capture
          </Link>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-panel">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-500">Home purpose</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold text-ink">Review</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Check processed and needs-review receipts.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">Filter</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Find the vendor or status that needs attention.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">Jump off</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Move into Capture, Exports, or Settings when needed.</p>
            </div>
          </div>
        </div>
      </section>
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
        <Link
          to="/app/exports"
          className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Open Exports
        </Link>
      </section>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-[1.5rem] border border-slate-200 bg-white/90 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="h-4 w-36 rounded-full bg-slate-200" />
                  <div className="h-3 w-24 rounded-full bg-slate-100" />
                </div>
                <div className="h-6 w-16 rounded-full bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ReceiptTable receipts={data?.data ?? []} />
      )}
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-panel">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide">Exports now live separately</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink">Templates and history moved into Exports.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Use the dedicated Exports surface for saved templates, filtered downloads, and recent export runs. The dashboard
            stays focused on the receipt inbox and recent work.
          </p>
          <Link
            to="/app/exports"
            className="mt-6 inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-ink"
          >
            Go to Exports
          </Link>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-panel">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-500">Home status</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-ink">Inbox first</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Home is now for recent receipts, review status, and quick navigation.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">Dedicated tools</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Capture, Exports, and Settings each now have a clearer role in the product.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
