import { Link } from "react-router-dom";

export const CapturePage = () => {
  return (
    <div className="space-y-8 py-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-panel">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide">Capture</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">
          Dedicated receipt capture is the next focused workflow.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          This screen is now wired into the product structure so capture can become its own task-first surface. In the next
          step, the uploader and processing states will move here from the dashboard.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-panel">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-300">Planned capture flow</p>
          <ol className="mt-5 space-y-4 text-sm text-slate-300">
            <li>1. Upload or snap the next receipt.</li>
            <li>2. Watch OCR processing in a focused state flow.</li>
            <li>3. Transition directly into the review screen.</li>
          </ol>
        </div>
        <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-panel">
          <h2 className="font-display text-2xl font-semibold text-ink">Current temporary path</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            The uploader still lives on the dashboard while Phase 1 is establishing the route structure.
          </p>
          <Link
            to="/app"
            className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Open dashboard uploader
          </Link>
        </div>
      </section>
    </div>
  );
};
