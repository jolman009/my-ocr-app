import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDocumentCorrections,
  getDocumentImageUrl,
  getShipmentDocument,
  updateShipmentDocument,
  type DocumentType,
  type ShipmentDocumentPatch,
  type ShipmentDocumentRecord
} from "../api/forwardingClient";
import { StatusBadge } from "../components/StatusBadge";
import { confidencePct, formatDateTime, prettyField } from "../lib/format";

const DOC_TYPES: DocumentType[] = ["label", "invoice", "packing_slip", "customs", "unknown"];

export const DocumentDetailPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["documents", id],
    queryFn: () => getShipmentDocument(id),
    enabled: Boolean(id)
  });
  const doc = query.data?.document;

  const historyQuery = useQuery({
    queryKey: ["documents", id, "corrections"],
    queryFn: () => getDocumentCorrections(id),
    enabled: Boolean(id)
  });
  const corrections = historyQuery.data?.corrections ?? [];

  const [form, setForm] = useState({
    trackingNumber: "",
    carrier: "",
    recipientName: "",
    mailboxNumber: "",
    documentType: null as DocumentType | null
  });

  useEffect(() => {
    if (!doc) return;
    setForm({
      trackingNumber: doc.trackingNumber ?? "",
      carrier: doc.carrier ?? "",
      recipientName: doc.recipientName ?? "",
      mailboxNumber: doc.mailboxNumber ?? "",
      documentType: doc.documentType ?? null
    });
  }, [doc]);

  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (patch: ShipmentDocumentPatch) => updateShipmentDocument(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      navigate("/app/review");
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Couldn't save. Try again.")
  });

  const fieldPatch = (): ShipmentDocumentPatch => ({
    trackingNumber: form.trackingNumber.trim() || null,
    carrier: form.carrier.trim() || null,
    recipientName: form.recipientName.trim() || null,
    mailboxNumber: form.mailboxNumber.trim() || null,
    documentType: form.documentType
  });

  const onAccept = () => {
    setError(null);
    mutation.mutate({ ...fieldPatch(), status: "processed" });
  };

  const onReject = () => {
    if (!window.confirm("Reject this document? It will be marked failed and leave the queue.")) {
      return;
    }
    setError(null);
    mutation.mutate({ status: "failed" });
  };

  const onSaveOnly = () => {
    setError(null);
    mutation.mutate(fieldPatch());
  };

  if (query.isLoading) {
    return <p className="text-muted">Loading…</p>;
  }
  if (query.isError || !doc) {
    return (
      <div className="space-y-4">
        <p className="text-red-400">
          {query.error instanceof Error ? query.error.message : "Document not found."}
        </p>
        <Link to="/app" className="text-ember underline">
          Back to documents
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button onClick={() => navigate(-1)} className="text-sm font-semibold text-muted hover:text-mist">
          ← Back
        </button>
        <StatusBadge status={doc.status} />
      </div>

      {doc.duplicateOfId ? (
        <DuplicateBanner originalId={doc.duplicateOfId} />
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: image + read-only extraction context */}
        <div className="space-y-4">
          {doc.imageUrl ? (
            <img
              src={getDocumentImageUrl(doc.imageUrl)}
              alt="Scanned document"
              className="w-full rounded-2xl border border-edge bg-panel object-contain"
            />
          ) : null}

          <Card>
            <ReadRow label="Extraction confidence" value={confidencePct(doc.confidence)} />
            <ReadRow
              label="Customer match"
              value={
                doc.matchedCustomerId
                  ? `Matched (${confidencePct(doc.customerMatchConfidence)})`
                  : "No match"
              }
            />
            {doc.barcodeRaw ? <ReadRow label="Barcode" value={doc.barcodeRaw} /> : null}
            <ReadRow label="Scanned" value={formatDateTime(doc.createdAt)} />
          </Card>

          {doc.ocrRawText ? (
            <Card>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">OCR text</p>
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-300">
                {doc.ocrRawText}
              </pre>
            </Card>
          ) : null}
        </div>

        {/* Right: editable fields + actions + audit trail */}
        <div className="space-y-4">
          <Card>
            <Field
              label="Tracking number"
              value={form.trackingNumber}
              onChange={(v) => setForm((f) => ({ ...f, trackingNumber: v }))}
            />
            <Field
              label="Carrier"
              value={form.carrier}
              onChange={(v) => setForm((f) => ({ ...f, carrier: v }))}
            />
            <Field
              label="Recipient"
              value={form.recipientName}
              onChange={(v) => setForm((f) => ({ ...f, recipientName: v }))}
            />
            <Field
              label="Mailbox / suite"
              value={form.mailboxNumber}
              onChange={(v) => setForm((f) => ({ ...f, mailboxNumber: v }))}
            />

            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Document type</p>
              <div className="flex flex-wrap gap-2">
                {DOC_TYPES.map((t) => {
                  const selected = form.documentType === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setForm((f) => ({ ...f, documentType: t }))}
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold capitalize transition ${
                        selected
                          ? "border-ember bg-ember/15 text-ember"
                          : "border-edge bg-ink text-muted hover:text-mist"
                      }`}
                    >
                      {t.replace("_", " ")}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onReject}
              disabled={mutation.isPending}
              className="rounded-xl border border-red-400/60 px-4 py-2.5 font-bold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
            >
              Reject
            </button>
            <button
              onClick={onSaveOnly}
              disabled={mutation.isPending}
              className="rounded-xl border border-edge bg-panel px-4 py-2.5 font-bold text-mist transition hover:border-ember/60 disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={onAccept}
              disabled={mutation.isPending}
              className="flex-1 rounded-xl bg-ember px-4 py-2.5 font-bold text-ink transition hover:bg-orange-500 disabled:opacity-50"
            >
              {mutation.isPending ? "Saving…" : "Save & accept"}
            </button>
          </div>

          <Card>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Edit history</p>
            {corrections.length === 0 ? (
              <p className="text-sm text-muted">No edits recorded yet.</p>
            ) : (
              <ul className="space-y-3">
                {corrections.map((c) => (
                  <li key={c.id} className="border-t border-edge/60 pt-3 first:border-0 first:pt-0">
                    <p className="text-xs font-bold capitalize text-muted">
                      {prettyField(c.fieldName)}
                    </p>
                    <p className="text-sm">
                      <span className="text-red-400">{c.oldValue ?? "—"}</span>
                      <span className="text-muted"> → </span>
                      <span className="font-bold text-emerald-400">{c.newValue ?? "—"}</span>
                    </p>
                    <p className="text-xs text-slate-500">{formatDateTime(c.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

const DuplicateBanner = ({ originalId }: { originalId: string }) => (
  <div className="rounded-xl border border-red-500/35 bg-red-500/10 p-4">
    <p className="font-bold text-red-400">Possible duplicate</p>
    <p className="mt-1 text-sm text-red-300">
      This tracking number matches an earlier scan (
      <Link to={`/app/documents/${originalId}`} className="underline">
        view original
      </Link>
      ). Accepting it is blocked while another document holds the same number — change the tracking
      number or reject this one.
    </p>
  </div>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="space-y-3 rounded-2xl border border-edge bg-panel p-5">{children}</div>
);

const Field = ({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <label className="block space-y-1.5">
    <span className="text-xs font-bold uppercase tracking-wide text-muted">{label}</span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-edge bg-ink px-3 py-2 text-sm text-mist outline-none focus:border-ember"
    />
  </label>
);

const ReadRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-sm text-muted">{label}</span>
    <span className="truncate text-sm font-semibold text-mist">{value}</span>
  </div>
);
