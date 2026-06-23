import type { ShipmentDocumentStatus } from "../api/forwardingClient";

export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
};

export const confidencePct = (c: number | null) =>
  c === null ? "—" : `${Math.round(c * 100)}%`;

export const statusLabel = (s: ShipmentDocumentStatus) => s.replace("_", " ");

export const statusClasses: Record<ShipmentDocumentStatus, string> = {
  processed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  needs_review: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  failed: "bg-red-500/15 text-red-400 border-red-500/30"
};

export const prettyField = (name: string) =>
  name
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
