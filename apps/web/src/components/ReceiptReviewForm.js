import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFieldArray, useForm } from "react-hook-form";
import { getReceiptImageUrl } from "@receipt-ocr/shared/api";
const toInputString = (value) => {
    if (value === null || value === undefined) {
        return "";
    }
    return String(value);
};
const toNullableNumber = (value) => {
    if (!value.trim()) {
        return null;
    }
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
};
const toFormValues = (receipt) => ({
    merchantName: toInputString(receipt.merchantName),
    receiptDate: toInputString(receipt.receiptDate),
    address: toInputString(receipt.address),
    subtotal: toInputString(receipt.subtotal),
    tax: toInputString(receipt.tax),
    tip: toInputString(receipt.tip),
    total: toInputString(receipt.total),
    currency: toInputString(receipt.currency),
    items: receipt.items.map((item) => ({
        name: item.name,
        quantity: toInputString(item.quantity),
        unitPrice: toInputString(item.unitPrice),
        totalPrice: toInputString(item.totalPrice)
    }))
});
export const ReceiptReviewForm = ({ receipt, onSave, saving }) => {
    const { register, control, handleSubmit, formState: { isDirty } } = useForm({
        values: toFormValues(receipt)
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });
    return (_jsxs("form", { onSubmit: handleSubmit(async (values) => {
            await onSave({
                ...receipt,
                merchantName: values.merchantName.trim() || null,
                receiptDate: values.receiptDate.trim() || null,
                address: values.address.trim() || null,
                subtotal: toNullableNumber(values.subtotal),
                tax: toNullableNumber(values.tax),
                tip: toNullableNumber(values.tip),
                total: toNullableNumber(values.total),
                currency: values.currency.trim() || null,
                items: values.items
                    .map((item) => ({
                    name: item.name.trim(),
                    quantity: toNullableNumber(item.quantity) ?? undefined,
                    unitPrice: toNullableNumber(item.unitPrice) ?? undefined,
                    totalPrice: toNullableNumber(item.totalPrice) ?? 0
                }))
                    .filter((item) => item.name.length > 0)
            });
        }), className: "grid gap-6 lg:grid-cols-[0.9fr_1.1fr]", children: [_jsxs("aside", { className: "space-y-4 rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-panel", children: [_jsx("div", { className: "overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100", children: _jsx("img", { src: getReceiptImageUrl(receipt.imageUrl), alt: receipt.merchantName ?? "Receipt", className: "w-full object-cover" }) }), _jsxs("div", { className: "rounded-[1.5rem] bg-slate-50 p-4", children: [_jsx("p", { className: "font-mono text-xs uppercase tracking-[0.25em] text-slate-500", children: "Confidence" }), _jsx("div", { className: "mt-3 space-y-2 text-sm text-slate-600", children: Object.entries(receipt.confidence).map(([key, value]) => (_jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsx("span", { children: key }), _jsxs("span", { className: "font-mono", children: [Math.round(value * 100), "%"] })] }, key))) })] })] }), _jsxs("section", { className: "rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-panel", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "font-mono text-xs uppercase tracking-[0.3em] text-tide", children: "Review" }), _jsx("h2", { className: "mt-2 font-display text-3xl font-semibold text-ink", children: "Confirm the extracted fields" })] }), _jsx("button", { type: "submit", disabled: saving, className: "rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60", children: saving ? "Saving..." : isDirty ? "Save corrections" : "Save receipt" })] }), _jsxs("div", { className: "mt-6 grid gap-4 sm:grid-cols-2", children: [_jsxs("label", { className: "space-y-2 text-sm", children: [_jsx("span", { className: "text-slate-600", children: "Merchant" }), _jsx("input", { ...register("merchantName"), className: "w-full rounded-2xl border border-slate-200 px-4 py-3" })] }), _jsxs("label", { className: "space-y-2 text-sm", children: [_jsx("span", { className: "text-slate-600", children: "Receipt Date" }), _jsx("input", { type: "date", ...register("receiptDate"), className: "w-full rounded-2xl border border-slate-200 px-4 py-3" })] }), _jsxs("label", { className: "space-y-2 text-sm sm:col-span-2", children: [_jsx("span", { className: "text-slate-600", children: "Address" }), _jsx("input", { ...register("address"), className: "w-full rounded-2xl border border-slate-200 px-4 py-3" })] }), _jsxs("label", { className: "space-y-2 text-sm", children: [_jsx("span", { className: "text-slate-600", children: "Subtotal" }), _jsx("input", { type: "number", step: "0.01", ...register("subtotal"), className: "w-full rounded-2xl border border-slate-200 px-4 py-3" })] }), _jsxs("label", { className: "space-y-2 text-sm", children: [_jsx("span", { className: "text-slate-600", children: "Tax" }), _jsx("input", { type: "number", step: "0.01", ...register("tax"), className: "w-full rounded-2xl border border-slate-200 px-4 py-3" })] }), _jsxs("label", { className: "space-y-2 text-sm", children: [_jsx("span", { className: "text-slate-600", children: "Tip" }), _jsx("input", { type: "number", step: "0.01", ...register("tip"), className: "w-full rounded-2xl border border-slate-200 px-4 py-3" })] }), _jsxs("label", { className: "space-y-2 text-sm", children: [_jsx("span", { className: "text-slate-600", children: "Total" }), _jsx("input", { type: "number", step: "0.01", ...register("total"), className: "w-full rounded-2xl border border-slate-200 px-4 py-3" })] }), _jsxs("label", { className: "space-y-2 text-sm", children: [_jsx("span", { className: "text-slate-600", children: "Currency" }), _jsx("input", { ...register("currency"), className: "w-full rounded-2xl border border-slate-200 px-4 py-3" })] })] }), _jsxs("div", { className: "mt-8", children: [_jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsx("h3", { className: "text-lg font-semibold text-ink", children: "Line Items" }), _jsx("button", { type: "button", onClick: () => append({ name: "", quantity: "", unitPrice: "", totalPrice: "0" }), className: "rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700", children: "Add item" })] }), _jsx("div", { className: "mt-4 space-y-3", children: fields.map((field, index) => (_jsxs("div", { className: "grid gap-3 rounded-3xl border border-slate-200 p-4 md:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr_auto]", children: [_jsx("input", { ...register(`items.${index}.name`), placeholder: "Item name", className: "rounded-2xl border border-slate-200 px-4 py-3" }), _jsx("input", { type: "number", step: "1", ...register(`items.${index}.quantity`), placeholder: "Qty", className: "rounded-2xl border border-slate-200 px-4 py-3" }), _jsx("input", { type: "number", step: "0.01", ...register(`items.${index}.unitPrice`), placeholder: "Unit", className: "rounded-2xl border border-slate-200 px-4 py-3" }), _jsx("input", { type: "number", step: "0.01", ...register(`items.${index}.totalPrice`), placeholder: "Total", className: "rounded-2xl border border-slate-200 px-4 py-3" }), _jsx("button", { type: "button", onClick: () => remove(index), className: "rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600", children: "Remove" })] }, field.id))) })] })] })] }));
};
