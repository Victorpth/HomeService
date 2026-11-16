import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/app/login/login-form";
import { getProfile, roleHome } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <LoginBody searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function LoginBody({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const profile = await getProfile();
  if (profile) {
    redirect(roleHome(profile.role));
  }

  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <>
      {error === "confirm" ? (
        <p className="text-sm" role="alert">
          That confirmation link is invalid or expired.
        </p>
      ) : null}
      <LoginForm />
      <p className="text-sm">
        No account yet?{" "}
        <Link href="/signup" className="font-medium underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </>
  );
}
