import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  listShipmentDocuments,
  type ShipmentDocumentRecord
} from "../api/forwardingClient";
import { formatDateTime } from "../lib/format";

// Mirrors apps/forwarding-mobile ReviewQueueScreen.reviewReason — duplicate
// takes top priority (#21), then the original triage cascade.
const reviewReason = (doc: ShipmentDocumentRecord): string => {
  if (doc.duplicateOfId) return "Possible duplicate";
  if (!doc.trackingNumber) return "No tracking number";
  if (doc.confidence !== null && doc.confidence < 0.5) return "Low extraction confidence";
  if (!doc.matchedCustomerId) return "No customer match";
  return "Needs review";
};

export const ReviewQueuePage = () => {
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ["documents", { status: "needs_review", limit: 100 }],
    queryFn: () => listShipmentDocuments({ status: "needs_review", limit: 100 })
  });

  const documents = query.data?.data ?? [];
  const total = query.data?.pagination.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-mist">Review queue</h1>
        <p className="text-sm text-muted">
          {query.isLoading ? "Loading…" : `${total} document${total === 1 ? "" : "s"} awaiting review`}
        </p>
      </div>

      {query.isError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {query.error instanceof Error ? query.error.message : "Failed to load queue"}
        </div>
      ) : null}

      {!documents.length && !query.isLoading ? (
        <div className="rounded-2xl border border-edge bg-panel/40 p-10 text-center">
          <p className="font-semibold text-mist">All clear</p>
          <p className="mt-1 text-sm text-muted">
            Nothing needs review right now. Documents that can't be read confidently show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => navigate(`/app/documents/${doc.id}`)}
              className="flex w-full items-center justify-between gap-4 rounded-xl border border-edge bg-panel px-5 py-4 text-left transition hover:border-ember/60"
            >
              <div className="min-w-0 space-y-1">
                <p className="truncate font-semibold text-mist">
                  {doc.trackingNumber ?? "No tracking number"}
                </p>
                <p
                  className={`text-sm font-bold ${
                    doc.duplicateOfId ? "text-red-400" : "text-amber-400"
                  }`}
                >
                  {reviewReason(doc)}
                </p>
                <p className="truncate text-sm text-muted">
                  {doc.carrier ?? "Unknown carrier"} · {formatDateTime(doc.createdAt)}
                </p>
              </div>
              <span className="text-2xl font-light text-muted">›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
