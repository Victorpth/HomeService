import { Suspense } from "react";

import { RolePanel } from "@/components/role-panel";
import { PageHeader, PageMain } from "@/components/page-header";

export const metadata = {
  title: "Host",
};

export default function HostPage() {
  return (
    <PageMain>
      <PageHeader title="Host" />
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <RolePanel role="host" />
      </Suspense>
    </PageMain>
  );
}
