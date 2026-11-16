import { Suspense } from "react";

import { RolePanel } from "@/components/role-panel";

export const metadata = {
  title: "Cook",
};

export default function CookPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Cook</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <RolePanel role="cook" />
      </Suspense>
    </main>
  );
}
