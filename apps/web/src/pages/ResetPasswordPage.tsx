import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useResetPassword } from "@receipt-ocr/shared/hooks";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const resetMutation = useResetPassword();

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    try {
      const response = await resetMutation.mutateAsync({ token, newPassword: password });
      setMessage(response.message);
      setSuccess(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Password reset failed.");
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist px-6">
        <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-panel">
          <h1 className="font-display text-2xl font-semibold text-ink">Invalid reset link</h1>
          <p className="mt-3 text-sm text-slate-500">This password reset link is missing or malformed.</p>
          <Link to="/auth?mode=login" className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-panel">
        <h1 className="font-display text-2xl font-semibold text-ink">Set a new password</h1>
        <p className="mt-2 text-sm text-slate-500">Choose a new password for your Receipt Radar account.</p>

        {success ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-tide font-semibold">{message}</p>
            <Link to="/auth?mode=login" className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Log in
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink">New password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-mist px-4 py-3 pr-16 placeholder-slate-400 outline-none transition focus:border-ember focus:bg-white"
                  placeholder="Min 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {message && <p className="text-sm text-ember">{message}</p>}

            <button
              type="submit"
              disabled={resetMutation.isPending}
              className="w-full rounded-full bg-ink py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
            >
              {resetMutation.isPending ? "Resetting..." : "Reset password"}
            </button>

            <Link to="/auth?mode=login" className="block text-center text-sm text-slate-500 hover:text-ink">
              Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};
