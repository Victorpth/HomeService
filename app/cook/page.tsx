import { Suspense } from "react";

import { CookStudio } from "@/app/cook/cook-studio";
import { PageHeader, PageMain } from "@/components/page-header";
import { RolePanel } from "@/components/role-panel";

export const metadata = {
  title: "Cook",
};

export default function CookPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  return (
    <PageMain width="3xl">
      <PageHeader title="Cook" />
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <RolePanel role="cook" />
      </Suspense>
      <Suspense fallback={<p className="text-sm text-muted">Loading your profile…</p>}>
        <CookStudio searchParams={searchParams} />
      </Suspense>
    </PageMain>
  );
}
