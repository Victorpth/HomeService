"use client";

import { useActionState } from "react";

import { login, type LoginState } from "@/app/login/actions";
import { alertClassName, fieldClassName, primaryButtonClassName } from "@/components/styles";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState | null, FormData>(
    login,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <label className="flex flex-col gap-2 text-sm text-ink" htmlFor="email">
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
        <p className={alertClassName} role="alert">
          {state.fieldErrors.email}
        </p>
      ) : null}

      <label className="flex flex-col gap-2 text-sm text-ink" htmlFor="password">
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
        <p className={alertClassName} role="alert">
          {state.fieldErrors.password}
        </p>
      ) : null}

      {state?.message ? (
        <p className="text-sm text-ink" role="alert">
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={primaryButtonClassName}>
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
