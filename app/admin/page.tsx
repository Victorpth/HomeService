import { Suspense } from "react";

import { PendingApplications } from "@/app/admin/pending-applications";
import { PageHeader, PageMain } from "@/components/page-header";
import { RolePanel } from "@/components/role-panel";

export const metadata = {
  title: "Admin",
};

export default function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  return (
    <PageMain width="3xl">
      <PageHeader title="Admin" />
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <RolePanel role="admin" />
      </Suspense>
      <Suspense fallback={<p className="text-sm text-muted">Loading applications…</p>}>
        <PendingApplications searchParams={searchParams} />
      </Suspense>
    </PageMain>
  );
}
