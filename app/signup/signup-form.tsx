"use client";

import { useActionState } from "react";

import { signup, type SignupState } from "@/app/signup/actions";
import { alertClassName, fieldClassName, primaryButtonClassName } from "@/components/styles";

export function SignupForm() {
  const [state, formAction, pending] = useActionState<SignupState | null, FormData>(
    signup,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <label className="flex flex-col gap-2 text-sm text-ink" htmlFor="fullName">
        Full name
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          className={fieldClassName}
        />
      </label>
      {state?.fieldErrors?.fullName ? (
        <p className={alertClassName} role="alert">
          {state.fieldErrors.fullName}
        </p>
      ) : null}

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
          autoComplete="new-password"
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
        <p className="text-sm text-ink" role="status">
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={primaryButtonClassName}>
        {pending ? "Creating account…" : "Sign up"}
      </button>
    </form>
  );
}
