import { Suspense } from "react";

import { RolePanel } from "@/components/role-panel";
import { PageHeader, PageMain } from "@/components/page-header";

export const metadata = {
  title: "Cook",
};

export default function CookPage() {
  return (
    <PageMain>
      <PageHeader title="Cook" />
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <RolePanel role="cook" />
      </Suspense>
    </PageMain>
  );
}
