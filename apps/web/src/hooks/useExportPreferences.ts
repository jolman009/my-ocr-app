import { useEffect, useMemo, useState } from "react";
import type { ExportFormat, ExportHistoryEntry, ExportTemplate, ReceiptFilters } from "@receipt-ocr/shared/types";

const STORAGE_KEY = "receipt-radar-export-preferences";

const nowIso = () => new Date().toISOString();

const defaultTemplate = (): ExportTemplate => ({
  id: "default-freelancer",
  name: "Freelancer default",
  columns: [
    { key: "receipt_date", label: "Date" },
    { key: "merchant_name", label: "Vendor" },
    { key: "subtotal", label: "Subtotal" },
    { key: "tax", label: "Tax" },
    { key: "total", label: "Total" },
    { key: "currency", label: "Currency" }
  ],
  dateFormat: "us",
  amountFormat: "currency",
  createdAt: nowIso(),
  updatedAt: nowIso()
});

type ExportPreferencesState = {
  templates: ExportTemplate[];
  selectedTemplateId: string | null;
  history: ExportHistoryEntry[];
};

const initialState = (): ExportPreferencesState => ({
  templates: [defaultTemplate()],
  selectedTemplateId: "default-freelancer",
  history: []
});

const describeFilters = (filters?: ReceiptFilters) => {
  if (!filters) {
    return "All receipts";
  }

  const parts = [
    filters.merchant ? `Vendor: ${filters.merchant}` : null,
    filters.status ? `Status: ${filters.status.replace("_", " ")}` : null,
    filters.dateFrom || filters.dateTo
      ? `Dates: ${filters.dateFrom ?? "start"} to ${filters.dateTo ?? "today"}`
      : null
  ].filter(Boolean);

  return parts.length ? parts.join(" | ") : "All receipts";
};

export const availableExportFields = [
  { key: "receipt_date", label: "Receipt date" },
  { key: "merchant_name", label: "Vendor" },
  { key: "subtotal", label: "Subtotal" },
  { key: "tax", label: "Tax" },
  { key: "tip", label: "Tip" },
  { key: "total", label: "Total" },
  { key: "currency", label: "Currency" },
  { key: "category", label: "Category" },
  { key: "status", label: "Status" },
  { key: "address", label: "Address" },
  { key: "item_count", label: "Item count" },
  { key: "created_at", label: "Created at" },
  { key: "id", label: "Receipt ID" }
] as const;

const loadState = (): ExportPreferencesState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Partial<ExportPreferencesState>;
    return {
      templates: parsed.templates?.length ? parsed.templates : initialState().templates,
      selectedTemplateId: parsed.selectedTemplateId ?? initialState().selectedTemplateId,
      history: parsed.history ?? []
    };
  } catch {
    return initialState();
  }
};

export const useExportPreferences = () => {
  const [state, setState] = useState<ExportPreferencesState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const selectedTemplate = useMemo(
    () => state.templates.find((template) => template.id === state.selectedTemplateId) ?? null,
    [state.selectedTemplateId, state.templates]
  );

  const saveTemplate = (input: Omit<ExportTemplate, "createdAt" | "updatedAt"> & { createdAt?: string }) => {
    setState((current) => {
      const existingIndex = current.templates.findIndex((template) => template.id === input.id);
      const nextTemplate: ExportTemplate = {
        ...input,
        createdAt: input.createdAt ?? nowIso(),
        updatedAt: nowIso()
      };

      const templates = [...current.templates];
      if (existingIndex === -1) {
        templates.push(nextTemplate);
      } else {
        templates[existingIndex] = {
          ...nextTemplate,
          createdAt: templates[existingIndex].createdAt
        };
      }

      return {
        ...current,
        templates,
        selectedTemplateId: nextTemplate.id
      };
    });
  };

  const deleteTemplate = (templateId: string) => {
    setState((current) => {
      const templates = current.templates.filter((template) => template.id !== templateId);
      const fallback = templates[0]?.id ?? null;
      return {
        ...current,
        templates,
        selectedTemplateId: current.selectedTemplateId === templateId ? fallback : current.selectedTemplateId
      };
    });
  };

  const setSelectedTemplateId = (templateId: string | null) => {
    setState((current) => ({
      ...current,
      selectedTemplateId: templateId
    }));
  };

  const recordExport = ({
    format,
    recordCount,
    filters,
    template
  }: {
    format: ExportFormat;
    recordCount: number;
    filters?: ReceiptFilters;
    template?: ExportTemplate | null;
  }) => {
    setState((current) => ({
      ...current,
      history: [
        {
          id: crypto.randomUUID(),
          templateId: template?.id ?? null,
          templateName: template?.name ?? "Standard export",
          format,
          recordCount,
          filtersLabel: describeFilters(filters),
          exportedAt: nowIso()
        },
        ...current.history
      ].slice(0, 12)
    }));
  };

  return {
    templates: state.templates,
    selectedTemplateId: state.selectedTemplateId,
    selectedTemplate,
    setSelectedTemplateId,
    saveTemplate,
    deleteTemplate,
    history: state.history,
    recordExport
  };
};
