import type { ExportHistoryEntry } from "@receipt-ocr/shared/types";

interface ExportHistoryPanelProps {
  history: ExportHistoryEntry[];
}

export const ExportHistoryPanel = ({ history }: ExportHistoryPanelProps) => {
  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-panel">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide">Export history</p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Recent export runs</h2>
      <div className="mt-6 space-y-3">
        {history.length ? (
          history.map((entry) => (
            <div key={entry.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-ink">{entry.templateName}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {entry.recordCount} records · {entry.format.toUpperCase()}
                  </p>
                </div>
                <div className="text-right text-xs uppercase tracking-[0.18em] text-slate-400">
                  {entry.exportedAt ? new Date(entry.exportedAt).toLocaleString() : "—"}
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">{entry.filtersLabel}</p>
            </div>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
            Your export history will appear here after the first CSV or Excel download.
          </div>
        )}
      </div>
    </section>
  );
};
