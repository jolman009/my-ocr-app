import { Link } from "react-router-dom";

export const ExportsPage = () => {
  return (
    <div className="space-y-8 py-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-panel">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide">Exports</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">
          Exports now have their own destination in the app.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          This screen is the future home for template management, filtered downloads, and export history. In the next UX
          step, those tools will move here out of the dashboard so the output workflow feels intentional.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-panel">
          <h2 className="font-display text-2xl font-semibold text-ink">Templates</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Saved export formats will live here as the dedicated configuration surface.
          </p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-panel">
          <h2 className="font-display text-2xl font-semibold text-ink">Downloads</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Filtered CSV and XLSX export will become a focused action here instead of a dashboard utility.
          </p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-panel">
          <h2 className="font-display text-2xl font-semibold text-ink">History</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Recent export runs will anchor repeat monthly and tax-season use.
          </p>
        </div>
      </section>

      <Link
        to="/app"
        className="inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-ink"
      >
        Back to current dashboard export tools
      </Link>
    </div>
  );
};
