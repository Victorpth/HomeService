import type { Metadata } from "next";
import Link from "next/link";

import { SignupForm } from "@/app/signup/signup-form";
import { PageHeader, PageMain } from "@/components/page-header";
import { textLinkClassName } from "@/components/styles";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  return (
    <PageMain>
      <PageHeader
        title="Create your account"
        description="New accounts start as a host."
      />
      <SignupForm />
      <p className="text-sm text-ink">
        Already have an account?{" "}
        <Link href="/login" className={textLinkClassName}>
          Log in
        </Link>
      </p>
    </PageMain>
  );
}
