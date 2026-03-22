import { useState } from "react";
import { downloadExport } from "@receipt-ocr/shared/api";
import type { ExportTemplate, ReceiptFilters } from "@receipt-ocr/shared/types";

interface ExportMenuProps {
  filters?: ReceiptFilters;
  recordCount: number;
  templates: ExportTemplate[];
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string | null) => void;
  onRecordExport: (payload: { format: "csv" | "xlsx"; template?: ExportTemplate | null }) => void;
}

export const ExportMenu = ({
  filters,
  recordCount,
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onRecordExport
}: ExportMenuProps) => {
  const [isExporting, setIsExporting] = useState<"csv" | "xlsx" | null>(null);
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) ?? null;

  const runExport = async (format: "csv" | "xlsx") => {
    try {
      setIsExporting(format);
      await downloadExport(format, filters, selectedTemplate ?? undefined);
      onRecordExport({ format, template: selectedTemplate });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[1.75rem] border border-white/70 bg-white/85 px-4 py-3 shadow-panel">
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-slate-500">Export</span>
      <select
        value={selectedTemplateId ?? ""}
        onChange={(event) => onSelectTemplate(event.target.value || null)}
        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600"
      >
        <option value="">Standard export</option>
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
          </option>
        ))}
      </select>
      <div className="text-sm text-slate-500">{recordCount} matching receipts</div>
      <button
        type="button"
        onClick={() => void runExport("csv")}
        disabled={!!isExporting}
        className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isExporting === "csv" ? "Preparing CSV..." : "CSV"}
      </button>
      <button
        type="button"
        onClick={() => void runExport("xlsx")}
        disabled={!!isExporting}
        className="rounded-full bg-ember px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isExporting === "xlsx" ? "Preparing XLSX..." : "XLSX"}
      </button>
    </div>
  );
};
