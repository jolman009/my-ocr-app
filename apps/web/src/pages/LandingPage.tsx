import { Link } from "react-router-dom";

const planCards = [
  {
    name: "Free",
    price: "$0",
    blurb: "For freelancers who want a clean receipt inbox and a dependable export.",
    note: "20 scans per month",
    cta: "Start free",
    href: "/auth?mode=signup&plan=free",
    accent: "border-white/60 bg-white/72"
  },
  {
    name: "Pro Preview",
    price: "$9",
    blurb: "For freelancers who want saved templates, vendor memory, and faster cleanup.",
    note: "Launching at $9/month",
    cta: "Join Pro preview",
    href: "/auth?mode=signup&plan=pro",
    accent: "border-ink/10 bg-ink text-white"
  }
];

const workflow = [
  {
    title: "Capture the receipt",
    copy: "Upload from the web workspace today, then keep the same review flow ready for mobile capture as the app expands."
  },
  {
    title: "Confirm the key fields",
    copy: "We optimize for vendor, date, subtotal, tax, total, and currency so you only review the fields that matter."
  },
  {
    title: "Export your format",
    copy: "Save a repeatable CSV or Excel layout for your spreadsheet, your accountant, or your tax-season folder."
  }
];

export const LandingPage = () => {
  return (
    <div className="bg-[#f3efe6] text-ink">
      <section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.88),_rgba(255,255,255,0.38)_42%,_transparent_68%),linear-gradient(135deg,_#f3efe6_0%,_#ebe2d3_38%,_#dce8e4_100%)]">
        <div className="landing-glow absolute left-[-14rem] top-[-12rem] h-[28rem] w-[28rem] rounded-full bg-ember/15 blur-3xl" />
        <div className="landing-glow absolute bottom-[-10rem] right-[-8rem] h-[24rem] w-[24rem] rounded-full bg-tide/15 blur-3xl" />
        <div className="mx-auto flex min-h-screen w-full max-w-[90rem] flex-col px-6 pb-12 pt-6 lg:px-10">
          <header className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/brand/receipt-radar-icon.svg"
                alt="Receipt Radar icon"
                className="h-11 w-11 rounded-xl border border-black/10 bg-white/80 p-2 shadow-sm"
              />
              <img
                src="/brand/receipt-radar-dark.svg"
                alt="Receipt Radar"
                className="h-9 w-auto"
              />
            </Link>
            <div className="flex items-center gap-3">
              <a href="#pricing" className="hidden text-sm font-medium text-slate-600 transition hover:text-ink sm:block">
                Pricing
              </a>
              <Link
                to="/auth?mode=login"
                className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-black/20 hover:bg-white"
              >
                Log in
              </Link>
            </div>
          </header>

          <div className="grid flex-1 items-center gap-16 py-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(25rem,0.88fr)]">
            <div className="max-w-xl">
              <p className="font-mono text-xs uppercase tracking-[0.38em] text-tide">Freelancer bookkeeping assistant</p>
              <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.96] tracking-[-0.04em] text-ink sm:text-6xl lg:text-7xl">
                Turn loose receipts into clean, export-ready records.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-700">
                Receipt Radar is the quiet middle ground between a scanner app and a full expense platform. Capture the
                receipt, fix the key fields, and export exactly what your spreadsheet or accountant needs.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  to="/auth?mode=signup&plan=free"
                  className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Start free
                </Link>
                <Link
                  to="/auth?mode=signup&plan=pro"
                  className="rounded-full border border-black/10 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-black/20 hover:bg-white"
                >
                  Join Pro preview
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-600">
                <span>Header-field OCR first</span>
                <span>Manual correction built in</span>
                <span>CSV and Excel exports</span>
              </div>
            </div>

            <div className="relative">
              <div className="receipt-stage relative mx-auto aspect-[0.92] w-full max-w-[36rem]">
                <div className="absolute left-[8%] top-0 z-10 w-[54%] rounded-[2rem] border border-white/75 bg-white/70 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur">
                  <img
                    src="/brand/receipt-radar-banner.svg"
                    alt="Receipt Radar banner"
                    className="h-auto w-full"
                  />
                </div>

                <div className="absolute left-[4%] top-[8%] h-[78%] w-[62%] rounded-[2.75rem] border border-black/10 bg-[#fffdf8] p-8 shadow-[0_42px_90px_rgba(15,23,42,0.16)]">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.36em] text-tide">Today</p>
                  <div className="mt-5 border-t border-dashed border-slate-300 pt-5">
                    <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">Coffee with client</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Vendor, date, subtotal, tax, and total are ready to review before export.
                    </p>
                  </div>
                  <div className="mt-8 space-y-4 text-sm text-slate-600">
                    <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3">
                      <span>Vendor</span>
                      <span className="font-semibold text-ink">Pine Street Coffee</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3">
                      <span>Date</span>
                      <span className="font-semibold text-ink">Mar 22, 2026</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3">
                      <span>Tax</span>
                      <span className="font-semibold text-ink">$1.82</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total</span>
                      <span className="font-display text-2xl font-semibold text-ink">$24.52</span>
                    </div>
                  </div>
                </div>

                <div className="receipt-note absolute right-[6%] top-[10%] w-[42%] rounded-[2rem] border border-white/70 bg-slate-950 p-6 text-white shadow-[0_32px_72px_rgba(15,23,42,0.26)]">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-emerald-300">Export template</p>
                  <div className="mt-5 space-y-3 text-sm text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>Date</span>
                      <span>transaction_date</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Vendor</span>
                      <span>merchant</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total</span>
                      <span>gross_amount</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tax</span>
                      <span>tax_paid</span>
                    </div>
                  </div>
                </div>

                <div className="receipt-note absolute bottom-[8%] right-[14%] w-[38%] rounded-[2rem] border border-ink/10 bg-white/85 p-5 shadow-[0_28px_60px_rgba(15,23,42,0.12)] backdrop-blur">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">Why freelancers pick it</p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                    <li>Fast correction, not finance-team overhead.</li>
                    <li>Saved formats for taxes and accountant handoff.</li>
                    <li>A calmer workflow than spreadsheets alone.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid gap-8 border-b border-black/10 pb-20 lg:grid-cols-[0.88fr_1.12fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide">Built for solo business life</p>
            <h2 className="mt-4 max-w-md font-display text-4xl font-semibold tracking-tight text-ink">
              Enough structure for bookkeeping, none of the team-expense clutter.
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold text-ink">Header fields first</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                We prioritize the details freelancers actually correct: vendor, date, subtotal, tax, total, and currency.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">Best-effort extras</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Line items can still grow over time, but they do not slow down the core export workflow that gets your books updated.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">Template-led exports</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                The end state is not a dashboard. It is a trustworthy CSV or Excel file in the exact column order you need.
              </p>
            </div>
          </div>
        </div>

        <div id="workflow" className="grid gap-10 py-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide">Workflow</p>
            <h2 className="mt-4 max-w-md font-display text-4xl font-semibold tracking-tight text-ink">
              Review only what matters, then move on with your day.
            </h2>
          </div>
          <div className="space-y-10">
            {workflow.map((step, index) => (
              <div key={step.title} className="grid gap-4 border-t border-black/10 pt-5 sm:grid-cols-[3rem_1fr]">
                <div className="font-display text-3xl font-semibold text-ember">0{index + 1}</div>
                <div>
                  <h3 className="text-xl font-semibold text-ink">{step.title}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">{step.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-y border-black/10 bg-[#f8f4ec]">
        <div className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide">Pricing</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink">
              Solo-friendly plans, shaped around scans and exports instead of seats.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              The free tier gets you into the core receipt workflow. Pro is the upgrade path for saved templates, vendor
              memory, and faster cleanup once billing is switched on.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {planCards.map((plan) => (
              <article key={plan.name} className={`rounded-[2.5rem] border p-8 shadow-[0_28px_64px_rgba(15,23,42,0.08)] ${plan.accent}`}>
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide/80">{plan.name}</p>
                    <h3 className="mt-4 font-display text-4xl font-semibold tracking-tight">{plan.price}</h3>
                  </div>
                  <p className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${plan.name === "Pro Preview" ? "bg-white/10 text-white" : "bg-slate-950/5 text-slate-600"}`}>
                    {plan.note}
                  </p>
                </div>
                <p className={`mt-6 max-w-lg text-sm leading-7 ${plan.name === "Pro Preview" ? "text-slate-300" : "text-slate-600"}`}>
                  {plan.blurb}
                </p>
                <div className={`mt-8 grid gap-3 text-sm ${plan.name === "Pro Preview" ? "text-slate-200" : "text-slate-700"}`}>
                  {plan.name === "Free" ? (
                    <>
                      <span>Header-field OCR and manual corrections</span>
                      <span>CSV and Excel export</span>
                      <span>One saved template once template builder ships</span>
                    </>
                  ) : (
                    <>
                      <span>Unlimited saved templates</span>
                      <span>Vendor memory and auto-categorization hints</span>
                      <span>Priority path for bulk cleanup and tax packs</span>
                    </>
                  )}
                </div>
                <Link
                  to={plan.href}
                  className={`mt-10 inline-flex rounded-full px-6 py-3 text-sm font-semibold transition ${
                    plan.name === "Pro Preview"
                      ? "bg-white text-ink hover:bg-slate-100"
                      : "bg-ink text-white hover:bg-slate-800"
                  }`}
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-8 border border-black/10 bg-white/70 px-8 py-10 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide">Get started</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink">
              Stop typing receipt totals by hand.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Start with the free workflow now, or join the Pro preview if customizable exports and faster cleanup are the
              reason you want the app in the first place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/auth?mode=signup&plan=free"
              className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Start free
            </Link>
            <Link
              to="/auth?mode=login"
              className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-black/20"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
