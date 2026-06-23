import { FormEvent, useState } from "react";
import { login as loginApi } from "@receipt-ocr/shared/api";
import { useAuthContext } from "../providers/AuthProvider";

export const LoginPage = () => {
  const { login } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const response = await loginApi({ email: email.trim(), password });
      login(response.token, response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 space-y-2">
          <p className="text-xs font-extrabold tracking-[0.3em] text-ember">MANIFEST 956</p>
          <h1 className="font-display text-3xl font-bold text-mist">Admin sign in</h1>
          <p className="text-sm text-muted">
            Use your Receipt Radar account. Both products share the same login.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-muted">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              disabled={submitting}
              className="w-full rounded-xl border border-edge bg-panel px-4 py-3 text-mist outline-none focus:border-ember"
              placeholder="you@example.com"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-muted">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={submitting}
              className="w-full rounded-xl border border-edge bg-panel px-4 py-3 text-mist outline-none focus:border-ember"
              placeholder="••••••••"
            />
          </label>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting || !email.trim() || !password}
            className="w-full rounded-xl bg-ember px-4 py-3 font-bold text-ink transition hover:bg-orange-500 disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};
