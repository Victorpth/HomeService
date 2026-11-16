import { Suspense, type ReactNode } from "react";

import { Logo } from "@/components/logo";
import { SiteNav } from "@/components/site-nav";
import { getProfile } from "@/lib/auth";
import { getAccountLinks } from "@/lib/account-nav";

export function SiteHeader() {
  return (
    <Suspense fallback={<HeaderShell />}>
      <HeaderNav />
    </Suspense>
  );
}

function HeaderShell({ children }: { children?: ReactNode }) {
  return (
    <header className="border-b border-white/10 bg-navy text-paper">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3 sm:px-6">
        <Logo />
        {children}
      </div>
    </header>
  );
}

async function HeaderNav() {
  const [profile, links] = await Promise.all([getProfile(), getAccountLinks()]);

  return (
    <HeaderShell>
      <SiteNav links={links} showSignOut={profile !== null} />
    </HeaderShell>
  );
}
