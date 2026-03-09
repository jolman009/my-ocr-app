import clsx from "clsx";

interface ProcessingStateProps {
  active: boolean;
  error?: string | null;
}

const steps = ["Upload", "OCR", "Parse", "Save"];

export const ProcessingState = ({ active, error }: ProcessingStateProps) => {
  if (!active && !error) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide">Processing</p>
          <h3 className="mt-2 font-display text-xl font-semibold text-ink">
            {error ? "Receipt processing failed" : "Extracting receipt data"}
          </h3>
        </div>
        <div className={clsx("h-3 w-3 rounded-full", error ? "bg-red-500" : "animate-pulse bg-ember")} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step} className="rounded-2xl bg-slate-50 px-3 py-4 text-center">
            <div className="font-mono text-xs text-slate-500">0{index + 1}</div>
            <div className="mt-1 text-sm font-medium text-ink">{step}</div>
          </div>
        ))}
      </div>
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
    </div>
  );
};