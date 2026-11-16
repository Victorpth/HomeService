"use client";

import { useActionState } from "react";

import { login, type LoginState } from "@/app/login/actions";

const fieldClassName =
  "h-11 rounded-lg border border-foreground/15 bg-transparent px-3 outline-none focus:border-foreground";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState | null, FormData>(
    login,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm" htmlFor="email">
        Email
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={fieldClassName}
        />
      </label>
      {state?.fieldErrors?.email ? (
        <p className="text-sm text-red-700 dark:text-red-400" role="alert">
          {state.fieldErrors.email}
        </p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm" htmlFor="password">
        Password
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className={fieldClassName}
        />
      </label>
      {state?.fieldErrors?.password ? (
        <p className="text-sm text-red-700 dark:text-red-400" role="alert">
          {state.fieldErrors.password}
        </p>
      ) : null}

      {state?.message ? (
        <p className="text-sm" role="alert">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background disabled:opacity-60"
      >
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
