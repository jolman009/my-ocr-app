import { getExportUrl } from "@receipt-ocr/shared/api";
import type { ReceiptFilters } from "@receipt-ocr/shared/types";

interface ExportMenuProps {
  filters?: ReceiptFilters;
}

export const ExportMenu = ({ filters }: ExportMenuProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-full border border-white/70 bg-white/85 px-4 py-3 shadow-panel">
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-slate-500">Export</span>
      <a href={getExportUrl("csv", filters)} className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">
        CSV
      </a>
      <a href={getExportUrl("xlsx", filters)} className="rounded-full bg-ember px-4 py-2 text-sm font-medium text-white">
        XLSX
      </a>
    </div>
  );
};
