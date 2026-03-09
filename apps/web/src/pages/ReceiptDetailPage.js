import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useParams } from "react-router-dom";
import { ReceiptReviewForm } from "../components/ReceiptReviewForm";
import { useReceipt, useUpdateReceipt } from "../hooks/useReceipts";
export const ReceiptDetailPage = () => {
    const { id = "" } = useParams();
    const { data, isLoading, error } = useReceipt(id);
    const updateMutation = useUpdateReceipt();
    if (isLoading) {
        return _jsx("div", { className: "rounded-[2rem] bg-white/90 p-6 shadow-panel", children: "Loading receipt..." });
    }
    if (error || !data) {
        return (_jsxs("div", { className: "rounded-[2rem] bg-white/90 p-6 shadow-panel", children: [_jsx("p", { className: "text-sm text-red-600", children: "Unable to load this receipt." }), _jsx(Link, { to: "/", className: "mt-4 inline-block text-sm font-medium text-ember", children: "Back to dashboard" })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(Link, { to: "/", className: "inline-flex rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-panel", children: "Back to dashboard" }), _jsx(ReceiptReviewForm, { receipt: data, saving: updateMutation.isPending, onSave: async (receipt) => {
                    await updateMutation.mutateAsync(receipt);
                } })] }));
};
