"use client";

import { useActionState } from "react";

import { signup, type SignupState } from "@/app/signup/actions";

const fieldClassName =
  "h-11 rounded-lg border border-foreground/15 bg-transparent px-3 outline-none focus:border-foreground";

export function SignupForm() {
  const [state, formAction, pending] = useActionState<SignupState | null, FormData>(
    signup,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm" htmlFor="fullName">
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
        <p className="text-sm text-red-700 dark:text-red-400" role="alert">
          {state.fieldErrors.fullName}
        </p>
      ) : null}

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
          autoComplete="new-password"
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
        <p className="text-sm" role="status">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Sign up"}
      </button>
    </form>
  );
}
