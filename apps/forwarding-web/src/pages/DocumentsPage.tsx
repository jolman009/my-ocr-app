import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  listShipmentDocuments,
  type DocumentType,
  type ShipmentDocumentStatus
} from "../api/forwardingClient";
import { StatusBadge } from "../components/StatusBadge";
import { confidencePct, formatDateTime } from "../lib/format";

const STATUSES: (ShipmentDocumentStatus | "")[] = ["", "processed", "needs_review", "failed"];
const TYPES: (DocumentType | "")[] = ["", "label", "invoice", "packing_slip", "customs", "unknown"];
const PAGE_SIZE = 20;

const useDebounced = <T,>(value: T, ms: number) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
};

export const DocumentsPage = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ShipmentDocumentStatus | "">("");
  const [type, setType] = useState<DocumentType | "">("");
  const [page, setPage] = useState(1);

  const debouncedQ = useDebounced(q, 300);

  // Reset to page 1 whenever a filter changes.
  useEffect(() => setPage(1), [debouncedQ, status, type]);

  const params = useMemo(
    () => ({
      q: debouncedQ || undefined,
      status: status || undefined,
      type: type || undefined,
      page,
      limit: PAGE_SIZE
    }),
    [debouncedQ, status, type, page]
  );

  const query = useQuery({
    queryKey: ["documents", params],
    queryFn: () => listShipmentDocuments(params),
    placeholderData: keepPreviousData
  });

  const documents = query.data?.data ?? [];
  const pagination = query.data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-mist">Documents</h1>
        <p className="text-sm text-muted">Search and review every scanned forwarding document.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tracking number…"
          className="min-w-[220px] flex-1 rounded-xl border border-edge bg-panel px-4 py-2.5 text-sm text-mist outline-none focus:border-ember"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ShipmentDocumentStatus | "")}
          className="rounded-xl border border-edge bg-panel px-3 py-2.5 text-sm text-mist outline-none focus:border-ember"
        >
          {STATUSES.map((s) => (
            <option key={s || "all"} value={s}>
              {s ? `Status: ${s.replace("_", " ")}` : "All statuses"}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as DocumentType | "")}
          className="rounded-xl border border-edge bg-panel px-3 py-2.5 text-sm text-mist outline-none focus:border-ember"
        >
          {TYPES.map((t) => (
            <option key={t || "all"} value={t}>
              {t ? `Type: ${t.replace("_", " ")}` : "All types"}
            </option>
          ))}
        </select>
      </div>

      {query.isError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {query.error instanceof Error ? query.error.message : "Failed to load documents"}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-edge">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-panel/60 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Tracking number</th>
              <th className="px-4 py-3 font-semibold">Carrier</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Confidence</th>
              <th className="px-4 py-3 font-semibold">Scanned</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr
                key={doc.id}
                onClick={() => navigate(`/app/documents/${doc.id}`)}
                className="cursor-pointer border-t border-edge/60 transition hover:bg-panel/40"
              >
                <td className="px-4 py-3 font-semibold text-mist">
                  {doc.trackingNumber ?? <span className="text-muted">—</span>}
                  {doc.duplicateOfId ? (
                    <span className="ml-2 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-bold text-red-400">
                      dup
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-muted">{doc.carrier ?? "—"}</td>
                <td className="px-4 py-3 capitalize text-muted">
                  {doc.documentType?.replace("_", " ") ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={doc.status} />
                </td>
                <td className="px-4 py-3 text-muted">{confidencePct(doc.confidence)}</td>
                <td className="px-4 py-3 text-muted">{formatDateTime(doc.createdAt)}</td>
              </tr>
            ))}
            {!documents.length && !query.isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  No documents match these filters.
                </td>
              </tr>
            ) : null}
            {query.isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  Loading…
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-edge bg-panel px-3 py-1.5 font-semibold text-mist disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="rounded-lg border border-edge bg-panel px-3 py-1.5 font-semibold text-mist disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
