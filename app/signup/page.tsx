import type { Metadata } from "next";
import Link from "next/link";

import { SignupForm } from "@/app/signup/signup-form";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          New accounts start as a host.
        </p>
      </div>
      <SignupForm />
      <p className="text-sm">
        Already have an account?{" "}
        <Link href="/login" className="font-medium underline underline-offset-4">
          Log in
        </Link>
      </p>
    </main>
  );
}
