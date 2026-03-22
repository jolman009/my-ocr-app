export const SettingsPage = () => {
  return (
    <div className="space-y-8 py-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-panel">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide">Settings</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">
          Settings now have a dedicated home.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          This is the right future surface for account details, plan state, scan usage, and export defaults. Phase 1 is
          establishing the route and navigation structure before we move real settings controls here.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-panel">
          <h2 className="font-display text-2xl font-semibold text-ink">Account</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Name, email, and account preferences will live here.
          </p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-panel">
          <h2 className="font-display text-2xl font-semibold text-ink">Plan</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Free versus Pro state, scan usage, and upgrade controls belong on this surface.
          </p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-panel">
          <h2 className="font-display text-2xl font-semibold text-ink">Defaults</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Export defaults and future workspace preferences will move here.
          </p>
        </div>
      </section>
    </div>
  );
};
