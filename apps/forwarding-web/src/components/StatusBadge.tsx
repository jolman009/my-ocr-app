import type { ShipmentDocumentStatus } from "../api/forwardingClient";
import { statusClasses, statusLabel } from "../lib/format";

export const StatusBadge = ({ status }: { status: ShipmentDocumentStatus }) => (
  <span
    className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${statusClasses[status]}`}
  >
    {statusLabel(status)}
  </span>
);
