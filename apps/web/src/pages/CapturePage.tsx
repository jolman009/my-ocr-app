import { Link } from "react-router-dom";
import { ReceiptUploader } from "../components/ReceiptUploader";

export const CapturePage = () => {
  return (
    <div className="space-y-8 py-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-panel">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide">Capture</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">
          Capture the next receipt without dashboard clutter.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          This is now the dedicated ingestion surface for Receipt Radar. Upload a file, snap a receipt, follow the OCR
          processing state, and continue straight into review once the data is ready.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-panel">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-300">Capture flow</p>
          <ol className="mt-5 space-y-4 text-sm text-slate-300">
            <li>1. Upload or snap the next receipt.</li>
            <li>2. Watch OCR processing in a focused state sequence.</li>
            <li>3. Transition directly into the review screen.</li>
          </ol>
        </div>
        <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-panel">
          <h2 className="font-display text-2xl font-semibold text-ink">Quality guidance</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Use JPEG, PNG, or WEBP when possible. Make sure totals are visible, the receipt is flat, and the image is not
            overly cropped or shadowed.
          </p>
          <Link
            to="/app/exports"
            className="mt-6 inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-ink"
          >
            Jump to exports
          </Link>
        </div>
      </section>

      <ReceiptUploader />
    </div>
  );
};
