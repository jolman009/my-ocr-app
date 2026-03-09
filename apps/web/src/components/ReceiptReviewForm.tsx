import { useFieldArray, useForm } from "react-hook-form";
import { getReceiptImageUrl } from "../api/client";
import type { ReceiptRecord } from "../types/receipt";

interface ReceiptReviewFormProps {
  receipt: ReceiptRecord;
  onSave: (receipt: ReceiptRecord) => Promise<void>;
  saving: boolean;
}

interface ReceiptFormValues {
  merchantName: string;
  receiptDate: string;
  address: string;
  subtotal: string;
  tax: string;
  tip: string;
  total: string;
  currency: string;
  items: Array<{
    name: string;
    quantity: string;
    unitPrice: string;
    totalPrice: string;
  }>;
}

const toInputString = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
};

const toNullableNumber = (value: string) => {
  if (!value.trim()) {
    return null;
  }
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const toFormValues = (receipt: ReceiptRecord): ReceiptFormValues => ({
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

export const ReceiptReviewForm = ({ receipt, onSave, saving }: ReceiptReviewFormProps) => {
  const { register, control, handleSubmit, formState: { isDirty } } = useForm<ReceiptFormValues>({
    values: toFormValues(receipt)
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
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
      })}
      className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"
    >
      <aside className="space-y-4 rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-panel">
        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100">
          <img src={getReceiptImageUrl(receipt.imageUrl)} alt={receipt.merchantName ?? "Receipt"} className="w-full object-cover" />
        </div>
        <div className="rounded-[1.5rem] bg-slate-50 p-4">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-slate-500">Confidence</p>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            {Object.entries(receipt.confidence).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <span>{key}</span>
                <span className="font-mono">{Math.round(value * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide">Review</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink">Confirm the extracted fields</h2>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Saving..." : isDirty ? "Save corrections" : "Save receipt"}
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-slate-600">Merchant</span>
            <input {...register("merchantName")} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-slate-600">Receipt Date</span>
            <input type="date" {...register("receiptDate")} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
          <label className="space-y-2 text-sm sm:col-span-2">
            <span className="text-slate-600">Address</span>
            <input {...register("address")} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-slate-600">Subtotal</span>
            <input type="number" step="0.01" {...register("subtotal")} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-slate-600">Tax</span>
            <input type="number" step="0.01" {...register("tax")} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-slate-600">Tip</span>
            <input type="number" step="0.01" {...register("tip")} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-slate-600">Total</span>
            <input type="number" step="0.01" {...register("total")} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-slate-600">Currency</span>
            <input {...register("currency")} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
        </div>
        <div className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-ink">Line Items</h3>
            <button
              type="button"
              onClick={() => append({ name: "", quantity: "", unitPrice: "", totalPrice: "0" })}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Add item
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-3xl border border-slate-200 p-4 md:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr_auto]">
                <input {...register(`items.${index}.name`)} placeholder="Item name" className="rounded-2xl border border-slate-200 px-4 py-3" />
                <input type="number" step="1" {...register(`items.${index}.quantity`)} placeholder="Qty" className="rounded-2xl border border-slate-200 px-4 py-3" />
                <input type="number" step="0.01" {...register(`items.${index}.unitPrice`)} placeholder="Unit" className="rounded-2xl border border-slate-200 px-4 py-3" />
                <input type="number" step="0.01" {...register(`items.${index}.totalPrice`)} placeholder="Total" className="rounded-2xl border border-slate-200 px-4 py-3" />
                <button type="button" onClick={() => remove(index)} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </form>
  );
};