import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLogin, useRegister } from "@receipt-ocr/shared/hooks";
import { useAuthContext } from "../providers/AuthProvider";

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useAuthContext();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { email: "", password: "", name: "" }
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const isPending = loginMutation.isPending || registerMutation.isPending;

  const onSubmit = async (data: any) => {
    try {
      if (isLogin) {
        const response = await loginMutation.mutateAsync({ email: data.email, password: data.password });
        login(response.token);
      } else {
        const response = await registerMutation.mutateAsync({ email: data.email, password: data.password, name: data.name });
        login(response.token);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Authentication failed.");
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col space-y-8 rounded-3xl bg-white p-10 shadow-panel mx-auto mt-20">
      <div>
        <h2 className="font-display text-3xl font-bold text-ink">Welcome</h2>
        <p className="mt-2 text-slate-500">
          {isLogin ? "Log in to view your ledger." : "Create an account to get started."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {!isLogin && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">Name</label>
            <input
              {...register("name", { required: !isLogin })}
              type="text"
              className="w-full rounded-2xl border border-slate-200 bg-mist px-4 py-3 placeholder-slate-400 outline-none focus:border-ember focus:bg-white"
            />
            {errors.name && <p className="text-sm text-ember">Name is required</p>}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">Email</label>
          <input
            {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" } })}
            type="email"
            className="w-full rounded-2xl border border-slate-200 bg-mist px-4 py-3 placeholder-slate-400 outline-none focus:border-ember focus:bg-white"
          />
          {errors.email && <p className="text-sm text-ember">{String(errors.email.message)}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">Password</label>
          <input
            {...register("password", { required: "Password is required", minLength: { value: 8, message: "Min 8 characters" } })}
            type="password"
            className="w-full rounded-2xl border border-slate-200 bg-mist px-4 py-3 placeholder-slate-400 outline-none focus:border-ember focus:bg-white"
          />
          {errors.password && <p className="text-sm text-ember">{String(errors.password.message)}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-ember py-4 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
        >
          {isPending ? "Loading..." : isLogin ? "Log in" : "Sign up"}
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setIsLogin(!isLogin);
            reset();
          }}
          className="w-full text-sm font-medium text-slate-500 hover:text-ink"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
        </button>
      </form>
    </div>
  );
};
