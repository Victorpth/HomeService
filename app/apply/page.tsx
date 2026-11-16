import { redirect } from "next/navigation";
import { Suspense } from "react";

import { signOut } from "@/app/actions/sign-out";
import { ApplyForm } from "@/app/apply/apply-form";
import { ApplicationSummary } from "@/components/application-summary";
import { PageHeader, PageMain } from "@/components/page-header";
import { primaryButtonClassName, surfaceClassName } from "@/components/styles";
import { getLiveAccount, roleHome } from "@/lib/auth";
import { readCookApplication } from "@/lib/cook-application";
import { signCvUrl } from "@/lib/cv-url";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Apply",
};

export default function ApplyPage() {
  return (
    <PageMain width="xl">
      <PageHeader title="Apply to cook" backHref="/host" backLabel="Back to my page" />
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <ApplyPanel />
      </Suspense>
    </PageMain>
  );
}

async function ApplyPanel() {
  const account = await getLiveAccount();

  if (account.status === "anonymous") {
    redirect("/login");
  }

  if (account.status === "missing") {
    return (
      <div className={`flex flex-col gap-4 ${surfaceClassName} p-6`}>
        <p>We could not find your profile.</p>
        <form action={signOut}>
          <button type="submit" className={primaryButtonClassName}>
            Sign out
          </button>
        </form>
      </div>
    );
  }

  if (account.profile.role !== "host") {
    redirect(roleHome(account.profile.role));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cook_applications")
    .select(
      "id, bio, specialties, cuisine_origin, zone, base_price_eur, photo_paths, cv_path, status, created_at",
    )
    .eq("user_id", account.profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return <p>We could not load your application.</p>;
  }

  const application = data ? readCookApplication(data) : null;

  if (data && !application) {
    return <p>We could not load your application.</p>;
  }

  if (application?.status === "pending" || application?.status === "approved") {
    const cvUrl = await signCvUrl(application.cvPath);
    return <ApplicationSummary application={application} cvUrl={cvUrl} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {application?.status === "rejected" ? (
        <p className={`${surfaceClassName} p-5 text-sm`}>
          Your last application was rejected. You can send a new one.
        </p>
      ) : null}
      <ApplyForm />
    </div>
  );
}
