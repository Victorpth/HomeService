import Link from "next/link";
import { Suspense } from "react";

import { getProfile, roleHome } from "@/lib/auth";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">HomeService</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Book a cook at home.
        </p>
      </div>
      <Suspense fallback={<p>Loading…</p>}>
        <HomeAuth />
      </Suspense>
    </main>
  );
}

async function HomeAuth() {
  const profile = await getProfile();

  if (!profile) {
    return (
      <div className="flex gap-3">
        <Link
          href="/signup"
          className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background"
        >
          Sign up
        </Link>
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-full border border-foreground/15 px-5 text-sm font-medium"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <p>Signed in as {profile.full_name}.</p>
      <Link
        href={roleHome(profile.role)}
        className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background"
      >
        Go to your page
      </Link>
    </div>
  );
}
