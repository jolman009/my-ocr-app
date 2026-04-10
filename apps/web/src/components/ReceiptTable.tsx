import { Link } from "react-router-dom";
import type { ReceiptRecord } from "@receipt-ocr/shared/types";

interface ReceiptTableProps {
  receipts: ReceiptRecord[];
}

const formatMoney = (value: number | null) => (value === null ? "-" : `$${value.toFixed(2)}`);

export const ReceiptTable = ({ receipts }: ReceiptTableProps) => {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-panel dark:border-slate-700 dark:bg-slate-800/90">
      <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide dark:text-emerald-400">Library</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-ink dark:text-slate-100">Saved receipts</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4 font-medium">Merchant</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Total</th>
              <th className="px-6 py-4 font-medium">Items</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((receipt) => (
              <tr key={receipt.id} className="border-t border-slate-100 hover:bg-slate-50/80 dark:border-slate-700 dark:hover:bg-slate-700/50">
                <td className="px-6 py-4 font-medium text-ink dark:text-slate-100">
                  <Link to={`/app/receipts/${receipt.id}`} className="hover:text-ember">
                    {receipt.merchantName ?? "Untitled receipt"}
                  </Link>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{receipt.receiptDate ?? "-"}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {receipt.category ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                      {receipt.category}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${receipt.status === "processed" ? "bg-tide/10 text-tide dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                    {receipt.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatMoney(receipt.total)}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{receipt.items.length}</td>
              </tr>
            ))}
            {!receipts.length ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                  No receipts yet. Upload one to start building your export-ready ledger.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
};
