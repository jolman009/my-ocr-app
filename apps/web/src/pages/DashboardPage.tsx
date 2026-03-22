import { useDeferredValue, useState } from "react";
import { Link } from "react-router-dom";
import type { ReceiptStatus } from "@receipt-ocr/shared/types";
import { ExportMenu } from "../components/ExportMenu";
import { ExportHistoryPanel } from "../components/ExportHistoryPanel";
import { ExportTemplateManager } from "../components/ExportTemplateManager";
import { ReceiptTable } from "../components/ReceiptTable";
import { ReceiptUploader } from "../components/ReceiptUploader";
import { useReceipts } from "@receipt-ocr/shared/hooks";
import { useExportPreferences } from "../hooks/useExportPreferences";

export const DashboardPage = () => {
  const [merchant, setMerchant] = useState("");
  const [status, setStatus] = useState<"" | ReceiptStatus>("");
  const deferredMerchant = useDeferredValue(merchant);
  const filters = {
    merchant: deferredMerchant || undefined,
    status: status || undefined
  };
  const { data, isLoading } = useReceipts(filters);
  const {
    templates,
    selectedTemplateId,
    setSelectedTemplateId,
    saveTemplate,
    deleteTemplate,
    history,
    recordExport
  } = useExportPreferences();

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-panel backdrop-blur">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-tide">Freelancer workflow</p>
          <h1 className="mt-4 max-w-2xl font-display text-5xl font-semibold tracking-tight text-ink">
            Keep your receipts tidy enough for books, taxes, and handoff.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Capture a receipt, confirm the header fields that matter, and export a cleaner record to CSV or Excel when you are ready.
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
        <ExportMenu
          filters={filters}
          recordCount={data?.pagination.total ?? 0}
          templates={templates}
          selectedTemplateId={selectedTemplateId}
          onSelectTemplate={setSelectedTemplateId}
          onRecordExport={({ format, template }) =>
            recordExport({
              format,
              recordCount: data?.pagination.total ?? 0,
              filters,
              template
            })
          }
        />
      </section>
      {isLoading ? <div className="rounded-[2rem] bg-white/90 p-6 shadow-panel">Loading receipts...</div> : <ReceiptTable receipts={data?.data ?? []} />}
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <ExportTemplateManager
          templates={templates}
          selectedTemplateId={selectedTemplateId}
          onSelectTemplate={setSelectedTemplateId}
          onSaveTemplate={saveTemplate}
          onDeleteTemplate={deleteTemplate}
        />
        <ExportHistoryPanel history={history} />
      </section>
    </div>
  );
};
