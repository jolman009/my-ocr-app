import { useMemo, useState } from "react";
import clsx from "clsx";
import type { ExportColumnConfig, ExportColumnKey, ExportTemplate } from "@receipt-ocr/shared/types";
import { availableExportFields } from "../hooks/useExportPreferences";

interface ExportTemplateManagerProps {
  templates: ExportTemplate[];
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string) => void;
  onSaveTemplate: (template: Omit<ExportTemplate, "createdAt" | "updatedAt"> & { createdAt?: string }) => void;
  onDeleteTemplate: (templateId: string) => void;
}

const emptyDraft = () => ({
  id: `template-${crypto.randomUUID()}`,
  name: "",
  columns: availableExportFields.slice(0, 6).map((field) => ({ key: field.key, label: field.label })) as ExportColumnConfig[],
  dateFormat: "us" as const,
  amountFormat: "currency" as const
});

type TemplateDraft = {
  id: string;
  name: string;
  columns: ExportColumnConfig[];
  dateFormat: ExportTemplate["dateFormat"];
  amountFormat: ExportTemplate["amountFormat"];
};

export const ExportTemplateManager = ({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onSaveTemplate,
  onDeleteTemplate
}: ExportTemplateManagerProps) => {
  const [draft, setDraft] = useState<TemplateDraft>(emptyDraft);
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates]
  );

  const loadTemplate = (template: ExportTemplate) => {
    setDraft({
      id: template.id,
      name: template.name,
      columns: template.columns,
      dateFormat: template.dateFormat,
      amountFormat: template.amountFormat
    });
    onSelectTemplate(template.id);
  };

  const updateColumn = (index: number, nextKey: ExportColumnKey) => {
    const fieldMeta = availableExportFields.find((field) => field.key === nextKey);
    setDraft((current) => ({
      ...current,
      columns: current.columns.map((column, columnIndex) =>
        columnIndex === index
          ? { key: nextKey, label: fieldMeta?.label ?? column.label }
          : column
      )
    }));
  };

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide">Export templates</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Shape the file your books expect</h2>
        </div>
        <button
          type="button"
          onClick={() => setDraft(emptyDraft())}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-ink"
        >
          New template
        </button>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          {templates.length === 0 && (
            <div className="rounded-[1.5rem] border border-dashed border-slate-200 px-5 py-8 text-center">
              <p className="font-semibold text-ink">No templates yet</p>
              <p className="mt-2 text-sm text-slate-500">Create your first export template to save column, date, and amount preferences for reuse.</p>
            </div>
          )}
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => loadTemplate(template)}
              className={clsx(
                "w-full rounded-[1.5rem] border px-4 py-4 text-left transition",
                selectedTemplateId === template.id
                  ? "border-ink bg-slate-950 text-white"
                  : "border-slate-200 bg-slate-50 text-ink hover:border-slate-300"
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className={clsx("mt-1 text-sm", selectedTemplateId === template.id ? "text-slate-300" : "text-slate-500")}>
                    {template.columns.length} columns · {template.dateFormat.toUpperCase()} dates
                  </p>
                </div>
                <span className={clsx("text-xs uppercase tracking-[0.2em]", selectedTemplateId === template.id ? "text-emerald-300" : "text-tide")}>
                  {selectedTemplateId === template.id ? "Selected" : "Saved"}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-ink">Template name</span>
              <input
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                placeholder="Tax season export"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-semibold text-ink">Date format</span>
              <select
                value={draft.dateFormat}
                onChange={(event) => setDraft((current) => ({ ...current, dateFormat: event.target.value as "us" | "iso" }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
              >
                <option value="us">MM/DD/YYYY</option>
                <option value="iso">YYYY-MM-DD</option>
              </select>
            </label>
          </div>

          <label className="mt-4 block space-y-2 text-sm">
            <span className="font-semibold text-ink">Amount format</span>
            <select
              value={draft.amountFormat}
              onChange={(event) =>
                setDraft((current) => ({ ...current, amountFormat: event.target.value as "plain" | "currency" }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <option value="currency">Currency strings</option>
              <option value="plain">Plain numbers</option>
            </select>
          </label>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Columns and labels</h3>
              <button
                type="button"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    columns: [...current.columns, { key: "status", label: "Status" }]
                  }))
                }
                className="text-sm font-semibold text-ember"
              >
                Add column
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {draft.columns.map((column, index) => (
                <div key={`${column.key}-${index}`} className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 md:grid-cols-[1fr_1fr_auto]">
                  <select
                    value={column.key}
                    onChange={(event) => updateColumn(index, event.target.value as ExportColumnKey)}
                    className="rounded-2xl border border-slate-200 px-3 py-3"
                  >
                    {availableExportFields.map((field) => (
                      <option key={field.key} value={field.key}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                  <input
                    value={column.label}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        columns: current.columns.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, label: event.target.value } : entry
                        )
                      }))
                    }
                    className="rounded-2xl border border-slate-200 px-3 py-3"
                    placeholder="Header label"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((current) => {
                          if (index === 0) return current;
                          const columns = [...current.columns];
                          [columns[index - 1], columns[index]] = [columns[index], columns[index - 1]];
                          return { ...current, columns };
                        })
                      }
                      className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          columns: current.columns.filter((_, columnIndex) => columnIndex !== index)
                        }))
                      }
                      className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                if (!draft.name.trim() || !draft.columns.length) {
                  return;
                }

                const createdAt = selectedTemplate?.id === draft.id ? selectedTemplate.createdAt : undefined;
                onSaveTemplate({
                  ...draft,
                  name: draft.name.trim(),
                  columns: draft.columns.filter((column) => column.label.trim()),
                  createdAt
                });
              }}
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Save template
            </button>
            {selectedTemplate && selectedTemplate.id === draft.id ? (
              <button
                type="button"
                onClick={() => {
                  onDeleteTemplate(selectedTemplate.id);
                  setDraft(emptyDraft());
                }}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600"
              >
                Delete template
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};
