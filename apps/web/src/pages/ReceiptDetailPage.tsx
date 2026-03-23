import { Link, useParams } from "react-router-dom";
import { ReceiptReviewForm } from "../components/ReceiptReviewForm";
import { useReceipt, useUpdateReceipt } from "@receipt-ocr/shared/hooks";

export const ReceiptDetailPage = () => {
  const { id = "" } = useParams();
  const { data, isLoading, error } = useReceipt(id);
  const updateMutation = useUpdateReceipt();

  if (isLoading) {
    return (
      <div className="space-y-6 py-6">
        <div className="h-10 w-40 animate-pulse rounded-full bg-slate-200" />
        <div className="animate-pulse rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-panel">
          <div className="space-y-4">
            <div className="h-5 w-48 rounded-full bg-slate-200" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-12 rounded-2xl bg-slate-100" />
              <div className="h-12 rounded-2xl bg-slate-100" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="h-12 rounded-2xl bg-slate-100" />
              <div className="h-12 rounded-2xl bg-slate-100" />
              <div className="h-12 rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-panel">
        <p className="font-semibold text-ink">Unable to load this receipt</p>
        <p className="mt-2 text-sm text-slate-500">
          {error?.message || "The receipt could not be found or a network error occurred."}
        </p>
        <Link to="/app" className="mt-5 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/app" className="inline-flex rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-panel">
        Back to dashboard
      </Link>
      <ReceiptReviewForm receipt={data} saving={updateMutation.isPending} onSave={async (receipt) => {
        await updateMutation.mutateAsync(receipt);
      }} />
    </div>
  );
};
