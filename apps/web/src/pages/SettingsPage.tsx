import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useChangePassword, useReceipts } from "@receipt-ocr/shared/hooks";
import { useAuthContext } from "../providers/AuthProvider";
import { useExportPreferences } from "../hooks/useExportPreferences";
import { useTheme } from "../providers/ThemeProvider";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

const THEME_OPTIONS = [
  { value: "light" as const, label: "Light", icon: "\u2600" },
  { value: "dark" as const, label: "Dark", icon: "\u263E" },
  { value: "system" as const, label: "System", icon: "\u2699" },
];

export const SettingsPage = () => {
  const { user } = useAuthContext();
  const { mode, setMode } = useTheme();
  const { templates, selectedTemplate, selectedTemplateId, setSelectedTemplateId, saveTemplate, history } = useExportPreferences();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const totalsQuery = useReceipts({ page: 1, limit: 1 });
  const needsReviewQuery = useReceipts({ page: 1, limit: 1, status: "needs_review" });
  const processedQuery = useReceipts({ page: 1, limit: 1, status: "processed" });
  const failedQuery = useReceipts({ page: 1, limit: 1, status: "failed" });
  const changePasswordMutation = useChangePassword();

  const totalReceipts = totalsQuery.data?.pagination.total ?? 0;
  const needsReview = needsReviewQuery.data?.pagination.total ?? 0;
  const processed = processedQuery.data?.pagination.total ?? 0;
  const failed = failedQuery.data?.pagination.total ?? 0;

  const librarySummary = useMemo(() => {
    if (!totalsQuery.data?.data?.length) {
      return null;
    }

    const latest = totalsQuery.data.data
      .slice()
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];

    return latest ? formatDate(latest.createdAt) : null;
  }, [totalsQuery.data]);

  const onPasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordMessage("New password must be at least 8 characters.");
      return;
    }

    try {
      const response = await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword
      });
      setPasswordMessage(response.message);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      setPasswordMessage(error instanceof Error ? error.message : "Password update failed.");
    }
  };

  return (
    <div className="space-y-8 py-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-panel dark:border-slate-700 dark:bg-slate-800/90">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide dark:text-emerald-400">Settings</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink dark:text-slate-100">
          Keep your account, defaults, and upgrade path in one calm place.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-400">
          Settings now own the parts of Receipt Radar that should feel steady instead of task-driven: who you are, what
          plan you are on, how much is in the receipt library, and which export format you want ready by default.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-panel dark:border-slate-700 dark:bg-slate-800/90">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide dark:text-emerald-400">Account summary</p>
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Name</p>
                <p className="mt-2 text-lg font-semibold text-ink dark:text-slate-100">{user?.name || "Receipt Radar freelancer"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Email</p>
                <p className="mt-2 text-base text-ink dark:text-slate-100">{user?.email || "Signed in account"}</p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-600 dark:bg-slate-700/50">
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Profile editing</p>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                  Name and email editing are not live yet. This section is meant to be stable account reference for now,
                  with fuller profile controls arriving alongside billing and admin polish.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-panel dark:border-slate-700 dark:bg-slate-800/90">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide dark:text-emerald-400">Appearance</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-ink dark:text-slate-100">Theme</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
              Choose how Receipt Radar looks. System follows your OS preference.
            </p>
            <div className="mt-5 flex gap-3">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMode(opt.value)}
                  className={`flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 px-4 py-4 text-sm font-semibold transition ${
                    mode === opt.value
                      ? "border-ember bg-ember/10 text-ember"
                      : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-600 dark:text-slate-400 dark:hover:border-slate-500"
                  }`}
                >
                  <span className="text-xl">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-panel">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-300">Plan and usage</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-slate-300">Current plan</p>
              <p className="mt-3 font-display text-3xl font-semibold text-white">Free</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Pro preview interest can still start from the landing page, but in-app billing is intentionally not live yet.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-slate-300">Receipt library</p>
              <p className="mt-3 font-display text-3xl font-semibold text-white">
                {totalsQuery.isLoading ? "..." : totalReceipts}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {librarySummary
                  ? `Latest captured receipt in this workspace: ${librarySummary}.`
                  : "Your receipt count will show here as soon as you upload something."}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Processed</p>
              <p className="mt-2 text-2xl font-semibold text-white">{processedQuery.isLoading ? "..." : processed}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Needs review</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {needsReviewQuery.isLoading ? "..." : needsReview}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Failed</p>
              <p className="mt-2 text-2xl font-semibold text-white">{failedQuery.isLoading ? "..." : failed}</p>
            </div>
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-4">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-slate-400">Usage note</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Scan metering is not enforced yet. For now this panel gives a truthful view of your current receipt library
              and review backlog, while the billing-ready structure stays in place for the next phase.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-panel dark:border-slate-700 dark:bg-slate-800/90">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide dark:text-emerald-400">Default export setup</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink dark:text-slate-100">Choose the template you want ready first.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
            This is not a full template editor. It is the lightweight settings home for your preferred default so the
            exports screen starts from the format you use most often.
          </p>

          <div className="mt-6 space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink dark:text-slate-200">Default template</span>
              <select
                value={selectedTemplateId ?? ""}
                onChange={(event) => setSelectedTemplateId(event.target.value || null)}
                className="w-full rounded-2xl border border-slate-200 bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember focus:bg-white dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:bg-slate-600"
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-600 dark:bg-slate-700/50">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Date format</span>
                <select
                  value={selectedTemplate?.dateFormat ?? "us"}
                  onChange={(event) => {
                    if (!selectedTemplate) return;
                    saveTemplate({ ...selectedTemplate, dateFormat: event.target.value as "us" | "iso" });
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-ink outline-none transition focus:border-ember dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                >
                  <option value="us">US (MM/DD/YYYY)</option>
                  <option value="iso">ISO (YYYY-MM-DD)</option>
                </select>
              </label>
              <label className="block rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-600 dark:bg-slate-700/50">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Amount format</span>
                <select
                  value={selectedTemplate?.amountFormat ?? "currency"}
                  onChange={(event) => {
                    if (!selectedTemplate) return;
                    saveTemplate({ ...selectedTemplate, amountFormat: event.target.value as "plain" | "currency" });
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-ink outline-none transition focus:border-ember dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                >
                  <option value="currency">Currency ($0.00)</option>
                  <option value="plain">Plain numbers</option>
                </select>
              </label>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-600 dark:bg-slate-700/50">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Included columns</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedTemplate?.columns.map((column) => (
                  <span
                    key={`${selectedTemplate.id}-${column.key}`}
                    className="rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600 shadow-sm dark:bg-slate-600 dark:text-slate-300"
                  >
                    {column.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/app/exports"
                className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                Open Exports
              </Link>
              <span className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400">
                {history.length} recent export{history.length === 1 ? "" : "s"} saved locally
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-panel dark:border-slate-700 dark:bg-slate-800/90">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-tide dark:text-emerald-400">Security</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink dark:text-slate-100">Update your password.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
            Keep this simple for now: password management is live, while fuller account administration lands later with
            billing and profile editing.
          </p>

          <form onSubmit={onPasswordSubmit} className="mt-6 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink dark:text-slate-200">Current password</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember focus:bg-white dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:bg-slate-600"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink dark:text-slate-200">New password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember focus:bg-white dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:bg-slate-600"
              />
            </label>

            {passwordMessage ? <p className="text-sm text-slate-500 dark:text-slate-400">{passwordMessage}</p> : null}

            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              {changePasswordMutation.isPending ? "Saving..." : "Update password"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
