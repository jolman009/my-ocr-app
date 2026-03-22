import { useDeferredValue, useState } from "react";
import { Link } from "react-router-dom";
import type { ReceiptStatus } from "@receipt-ocr/shared/types";
import { useReceipts } from "@receipt-ocr/shared/hooks";
import { ExportHistoryPanel } from "../components/ExportHistoryPanel";
import { ExportMenu } from "../components/ExportMenu";
import { ExportTemplateManager } from "../components/ExportTemplateManager";
import { useExportPreferences } from "../hooks/useExportPreferences";

export const ExportsPage = () => {
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
    <div className="space-y-8 py-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-panel">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide">Exports</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">
          Build the exact file your spreadsheet or accountant expects.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          Exports now own template management, filtered downloads, and history. Use this surface to shape your output and run
          repeat bookkeeping exports without digging through the dashboard.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-panel">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-300">Export workflow</p>
          <ol className="mt-5 space-y-4 text-sm text-slate-300">
            <li>1. Filter the receipts you want to include.</li>
            <li>2. Pick or edit the template that matches your bookkeeping format.</li>
            <li>3. Export CSV or XLSX and keep a record of what you ran.</li>
          </ol>
        </div>
        <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-panel">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide">Export scope</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-ink">Vendor filter</span>
              <input
                value={merchant}
                onChange={(event) => setMerchant(event.target.value)}
                placeholder="Filter by vendor"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-ink">Status filter</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as "" | ReceiptStatus)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
              >
                <option value="">All statuses</option>
                <option value="processed">Processed</option>
                <option value="needs_review">Needs review</option>
                <option value="failed">Failed</option>
              </select>
            </label>
          </div>
          <div className="mt-6">
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
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {isLoading ? "Refreshing matching receipts..." : `${data?.pagination.total ?? 0} receipts currently match these filters.`}
          </p>
        </div>
      </section>

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

      {history.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-8 shadow-panel">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-500">First export tip</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink">Saved templates keep tax-season exports boring.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
            Create a template once for your spreadsheet or accountant, then reuse it every month. That way your output format
            stays consistent even when the receipts change.
          </p>
        </section>
      ) : null}

      <Link
        to="/app"
        className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-ink"
      >
        Back to workspace home
      </Link>
    </div>
  );
};
