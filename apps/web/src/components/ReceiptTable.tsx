import { Link } from "react-router-dom";
import type { ReceiptRecord } from "@receipt-ocr/shared/types";

interface ReceiptTableProps {
  receipts: ReceiptRecord[];
}

const formatMoney = (value: number | null) => (value === null ? "-" : `$${value.toFixed(2)}`);

export const ReceiptTable = ({ receipts }: ReceiptTableProps) => {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-panel">
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide">Library</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Saved receipts</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Merchant</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Total</th>
              <th className="px-6 py-4 font-medium">Items</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((receipt) => (
              <tr key={receipt.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                <td className="px-6 py-4 font-medium text-ink">
                  <Link to={`/receipts/${receipt.id}`} className="hover:text-ember">
                    {receipt.merchantName ?? "Untitled receipt"}
                  </Link>
                </td>
                <td className="px-6 py-4 text-slate-600">{receipt.receiptDate ?? "-"}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${receipt.status === "processed" ? "bg-tide/10 text-tide" : "bg-amber-100 text-amber-700"}`}>
                    {receipt.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{formatMoney(receipt.total)}</td>
                <td className="px-6 py-4 text-slate-600">{receipt.items.length}</td>
              </tr>
            ))}
            {!receipts.length ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No receipts yet. Upload one to start building the ledger.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
};
