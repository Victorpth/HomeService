import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/app/login/login-form";
import { PageHeader, PageMain } from "@/components/page-header";
import { textLinkClassName } from "@/components/styles";
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
    <PageMain>
      <PageHeader title="Log in" />
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <LoginBody searchParams={searchParams} />
      </Suspense>
    </PageMain>
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
        <p className="text-sm text-danger" role="alert">
          That confirmation link is invalid or expired.
        </p>
      ) : null}
      <LoginForm />
      <p className="text-sm text-ink">
        No account yet?{" "}
        <Link href="/signup" className={textLinkClassName}>
          Sign up
        </Link>
      </p>
    </>
  );
}
