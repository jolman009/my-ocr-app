import { Link, useParams } from "react-router-dom";
import { ReceiptReviewForm } from "../components/ReceiptReviewForm";
import { useReceipt, useUpdateReceipt } from "../hooks/useReceipts";

export const ReceiptDetailPage = () => {
  const { id = "" } = useParams();
  const { data, isLoading, error } = useReceipt(id);
  const updateMutation = useUpdateReceipt();

  if (isLoading) {
    return <div className="rounded-[2rem] bg-white/90 p-6 shadow-panel">Loading receipt...</div>;
  }

  if (error || !data) {
    return (
      <div className="rounded-[2rem] bg-white/90 p-6 shadow-panel">
        <p className="text-sm text-red-600">Unable to load this receipt.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-ember">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-panel">
        Back to dashboard
      </Link>
      <ReceiptReviewForm receipt={data} saving={updateMutation.isPending} onSave={async (receipt) => {
        await updateMutation.mutateAsync(receipt);
      }} />
    </div>
  );
};