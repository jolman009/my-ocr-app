import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useLogin, useRegister } from "@receipt-ocr/shared/hooks";
import { useAuthContext } from "../providers/AuthProvider";

type AuthFormValues = {
  email: string;
  password: string;
  name: string;
};

const planCopy = {
  free: {
    eyebrow: "Free workspace",
    title: "Start with the core receipt flow.",
    description: "Create an account to upload receipts, review the extracted header fields, and export clean data."
  },
  pro: {
    eyebrow: "Pro preview",
    title: "Join the template-first upgrade path.",
    description:
      "Create your account now and we'll keep your signup attached to the Pro preview path as billing and advanced export tooling come online."
  }
} as const;

export const AuthPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isLogin = searchParams.get("mode") !== "signup";
  const selectedPlan = searchParams.get("plan") === "pro" ? "pro" : "free";
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AuthFormValues>({
    defaultValues: { email: "", password: "", name: "" }
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const isPending = loginMutation.isPending || registerMutation.isPending;

  const setMode = (mode: "login" | "signup") => {
    const next = new URLSearchParams(searchParams);
    next.set("mode", mode);
    if (mode === "login") {
      next.delete("plan");
    } else if (!next.get("plan")) {
      next.set("plan", "free");
    }
    setSearchParams(next, { replace: true });
    reset();
  };

  const onSubmit = async (data: AuthFormValues) => {
    try {
      if (isLogin) {
        const response = await loginMutation.mutateAsync({ email: data.email, password: data.password });
        login(response.token);
      } else {
        const response = await registerMutation.mutateAsync({
          email: data.email,
          password: data.password,
          name: data.name
        });
        login(response.token);
      }
      navigate("/app", { replace: true });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Authentication failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f3efe6] px-6 py-6 text-ink lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white/80 shadow-sm">
            <img
              src="/brand/receipt-radar-icon.svg"
              alt="Receipt Radar icon"
              className="h-[4.5rem] w-[4.5rem] max-w-none shrink-0"
            />
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight text-ink">Receipt Radar</span>
          {/* TODO: Revisit receipt-radar-dark.svg for header branding if we implement dark mode. */}
        </Link>
        <Link
          to="/"
          className="rounded-full border border-black/10 bg-white/75 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-black/20 hover:bg-white"
        >
          Back to home
        </Link>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-8 py-10 lg:grid-cols-[minmax(0,0.96fr)_minmax(22rem,0.8fr)]">
        <section className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-[linear-gradient(145deg,_rgba(15,23,42,0.96),_rgba(15,23,42,0.78)),radial-gradient(circle_at_top_left,_rgba(249,115,22,0.28),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(15,118,110,0.24),_transparent_34%)] p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] sm:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.34em] text-emerald-300">
            {isLogin ? "Welcome back" : planCopy[selectedPlan].eyebrow}
          </p>
          <h1 className="mt-5 max-w-xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {isLogin ? "Pick up where your receipt review left off." : planCopy[selectedPlan].title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
            {isLogin
              ? "Log in to review OCR results, correct totals, and export the receipts you have already captured."
              : planCopy[selectedPlan].description}
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-slate-400">Why this product exists</p>
              <p className="mt-4 text-sm leading-7 text-slate-200">
                It is a calmer middle ground between a generic scanner and a full team expense suite.
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-slate-400">What happens after signup</p>
              <p className="mt-4 text-sm leading-7 text-slate-200">
                Upload a receipt, confirm the key fields, then export a clean record to your spreadsheet workflow.
              </p>
            </div>
          </div>

          {!isLogin ? (
            <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-slate-400">Selected path</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                  {selectedPlan === "pro" ? "Pro preview" : "Free"}
                </span>
                <span className="text-sm text-slate-300">
                  {selectedPlan === "pro"
                    ? "Pro billing is not live in-app yet, so this signup captures your account and preview intent."
                    : "You can start with the core workflow immediately after signup."}
                </span>
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-[2.5rem] border border-white/70 bg-white/82 p-8 shadow-panel backdrop-blur sm:p-10">
          <div className="flex items-center gap-3 rounded-full bg-slate-950/5 p-1 text-sm">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-full px-4 py-2 font-semibold transition ${
                isLogin ? "bg-ink text-white" : "text-slate-500 hover:text-ink"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-full px-4 py-2 font-semibold transition ${
                !isLogin ? "bg-ink text-white" : "text-slate-500 hover:text-ink"
              }`}
            >
              Sign up
            </button>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-3xl font-semibold text-ink">
              {isLogin ? "Log in to your workspace" : "Create your account"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {isLogin
                ? "Use the email and password attached to your receipt workspace."
                : "A simple account now keeps your receipts, exports, and template progress tied to one place."}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink">Name</label>
                <input
                  {...register("name", { required: !isLogin ? "Name is required" : false })}
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-mist px-4 py-3 placeholder-slate-400 outline-none transition focus:border-ember focus:bg-white"
                />
                {errors.name && <p className="text-sm text-ember">{String(errors.name.message)}</p>}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink">Email</label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" }
                })}
                type="email"
                className="w-full rounded-2xl border border-slate-200 bg-mist px-4 py-3 placeholder-slate-400 outline-none transition focus:border-ember focus:bg-white"
              />
              {errors.email && <p className="text-sm text-ember">{String(errors.email.message)}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-ink">Password</label>
              <div className="relative">
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Min 8 characters" }
                  })}
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-2xl border border-slate-200 bg-mist px-4 py-3 pr-16 placeholder-slate-400 outline-none transition focus:border-ember focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="text-sm text-ember">{String(errors.password.message)}</p>}
            </div>

            {!isLogin ? (
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-tide">Selected plan</p>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">{selectedPlan === "pro" ? "Pro preview" : "Free"}</p>
                    <p className="text-sm text-slate-500">
                      {selectedPlan === "pro"
                        ? "We'll preserve your preview interest as the paid upgrade path ships."
                        : "Start with the core receipt workflow and export tools."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.set("plan", selectedPlan === "pro" ? "free" : "pro");
                      setSearchParams(next, { replace: true });
                    }}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-ink"
                  >
                    Switch
                  </button>
                </div>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-full bg-ink py-4 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
            >
              {isPending ? "Loading..." : isLogin ? "Log in" : "Create account"}
            </button>

            <Link to="/privacy" className="block text-center text-xs text-slate-400 underline hover:text-slate-500">
              Privacy Policy
            </Link>
          </form>
        </section>
      </div>
    </div>
  );
};
